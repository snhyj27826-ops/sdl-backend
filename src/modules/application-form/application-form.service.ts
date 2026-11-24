import { UPLOADS_DIR } from '../../common/paths';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { promises as fs } from 'fs';
import { basename, join } from 'path';

import { EmailService } from '../email/email.service';
import {
  ApplicationDocument,
  ApplicationForm,
} from './application-form.schema';
import { PdfService } from './pdf/pdf.service';
import { PartyRulesPdfService } from './party-rules-pdf/party-rules-pdf.service';
import { CreateApplicationDto } from './application-form.dto';

const APPLICATION_RECIPIENT = 'info@sdl.org.mk';
const MAX_EMAIL_ATTEMPTS = 10;
const RETRY_AFTER_MS = 5 * 60 * 1000;
const STALE_LOCK_MS = 10 * 60 * 1000;
const RETRY_BATCH_SIZE = 20;

@Injectable()
export class ApplicationFormService {
  private readonly logger = new Logger(ApplicationFormService.name);

  constructor(
    @InjectModel(ApplicationForm.name)
    private readonly applicationModel: Model<ApplicationDocument>,

    private readonly pdfService: PdfService,

    private readonly partyRulesPdfService: PartyRulesPdfService,

    private readonly emailService: EmailService,
  ) {}

  async create(dto: CreateApplicationDto) {
    // 1. Save the application. `delivery` is always set server-side so a
    // client can never pre-mark the email as sent.
    const application = await this.applicationModel.create({
      ...dto,
      delivery: { status: 'pending', attempts: 0, attachments: [] },
    });

    // 2. Generate the PDF
    const { buffer, filename } = await this.pdfService.generateApplicationPdf(
      dto,
      application.createdAt,
    );

    // 3. Save the PDF on disk, in a folder shared with the party rules PDF
    const folder = this.createApplicationFolderName(dto, application.createdAt);
    const document = await this.pdfService.saveApplicationPdf(
      buffer,
      filename,
      folder,
    );

    // 4. Party rules agreement PDF (separate from the application PDF)
    const partyRules = await this.createPartyRulesDocument(dto, folder);

    // 5. Remember which files belong to this application, then email them.
    // The record and files are already safe; if sending fails, the retry job
    // picks the application up again instead of failing the submission.
    await this.applicationModel.updateOne(
      { _id: application._id },
      {
        $set: {
          'delivery.attachments': [
            this.toUploadsPath(document.publicUrl),
            ...(partyRules ? [this.toUploadsPath(partyRules.publicUrl)] : []),
          ],
        },
      },
    );
    const emailSent = await this.deliverEmail(application._id);

    // 6. Return something useful to the frontend
    return {
      id: application._id,
      message: 'Application submitted successfully',
      document,
      partyRulesDocument: partyRules && { publicUrl: partyRules.publicUrl },
      email: emailSent ? 'sent' : 'queued',
    };
  }

  // Sends the stored PDFs for one application. Never throws; returns whether
  // the email went out. Safe to call concurrently: only one caller can claim
  // the record at a time.
  async deliverEmail(id: Types.ObjectId | string): Promise<boolean> {
    const now = new Date();
    const claimed = await this.applicationModel.findOneAndUpdate(
      {
        _id: id,
        $or: [
          { 'delivery.status': { $in: ['pending', 'failed'] } },
          {
            'delivery.status': 'sending',
            'delivery.lockedAt': { $lt: new Date(Date.now() - STALE_LOCK_MS) },
          },
        ],
      },
      {
        $set: { 'delivery.status': 'sending', 'delivery.lockedAt': now },
        $inc: { 'delivery.attempts': 1 },
      },
      { returnDocument: 'after' },
    );

    if (!claimed?.delivery) {
      return false;
    }

    try {
      const [primary, ...rest] = await Promise.all(
        claimed.delivery.attachments.map(async (relativePath) => ({
          filename: basename(relativePath),
          content: await fs.readFile(join(UPLOADS_DIR, relativePath)),
        })),
      );

      if (!primary) {
        throw new Error('No stored PDF to send.');
      }

      await this.emailService.sendApplicationEmail(
        APPLICATION_RECIPIENT,
        primary.content,
        primary.filename,
        rest,
      );

      await this.applicationModel.updateOne(
        { _id: id },
        {
          $set: { 'delivery.status': 'sent', 'delivery.sentAt': new Date() },
          $unset: { 'delivery.lockedAt': '', 'delivery.lastError': '' },
        },
      );

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Email for application ${String(id)} failed (attempt ${claimed.delivery.attempts}): ${message}`,
      );

      await this.applicationModel.updateOne(
        { _id: id },
        {
          $set: { 'delivery.status': 'failed', 'delivery.lastError': message },
          $unset: { 'delivery.lockedAt': '' },
        },
      );

      return false;
    }
  }

  // Called periodically; re-sends emails that never went out.
  async retryPendingEmails(): Promise<number> {
    const candidates = await this.applicationModel
      .find({
        $or: [
          {
            'delivery.status': { $in: ['pending', 'failed'] },
            'delivery.attempts': { $lt: MAX_EMAIL_ATTEMPTS },
            updatedAt: { $lt: new Date(Date.now() - RETRY_AFTER_MS) },
          },
          {
            'delivery.status': 'sending',
            'delivery.lockedAt': { $lt: new Date(Date.now() - STALE_LOCK_MS) },
          },
        ],
      })
      .sort({ updatedAt: 1 })
      .limit(RETRY_BATCH_SIZE)
      .select('_id')
      .lean();

    let sent = 0;
    for (const { _id } of candidates) {
      if (await this.deliverEmail(_id)) {
        sent += 1;
      }
    }

    if (candidates.length) {
      this.logger.log(`Email retry: ${sent}/${candidates.length} sent`);
    }

    return sent;
  }

  private toUploadsPath(publicUrl: string): string {
    return publicUrl.replace(/^\/uploads\//, '');
  }

  // Only generated when the applicant agreed to the party's rules. A failure
  // here must not affect the already completed application submission.
  private async createPartyRulesDocument(
    dto: CreateApplicationDto,
    folder: string,
  ) {
    if (dto.consent !== true) {
      return null;
    }

    try {
      const { buffer, filename } =
        await this.partyRulesPdfService.generatePartyRulesPdf(dto);

      const { publicUrl } = await this.partyRulesPdfService.savePartyRulesPdf(
        buffer,
        filename,
        folder,
      );

      return { publicUrl, buffer, filename };
    } catch (error) {
      console.error('Failed to create party rules document:', error);
      return null;
    }
  }

  // firstName-lastName-timestamp: one folder per application.
  private createApplicationFolderName(
    dto: CreateApplicationDto,
    createdAt: Date,
  ): string {
    const clean = (value: string) =>
      value
        .trim()
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
        .replace(/\s+/g, '-');

    return `${clean(dto.firstName)}-${clean(dto.lastName)}-${createdAt.getTime()}`;
  }
}
