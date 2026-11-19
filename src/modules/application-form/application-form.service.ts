import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { EmailService } from '../email/email.service';
import {
  ApplicationDocument,
  ApplicationForm,
} from './application-form.schema';
import { PdfService } from './pdf/pdf.service';
import { PartyRulesPdfService } from './party-rules-pdf/party-rules-pdf.service';
import { CreateApplicationDto } from './application-form.dto';

@Injectable()
export class ApplicationFormService {
  constructor(
    @InjectModel(ApplicationForm.name)
    private readonly applicationModel: Model<ApplicationDocument>,

    private readonly pdfService: PdfService,

    private readonly partyRulesPdfService: PartyRulesPdfService,

    private readonly emailService: EmailService,
  ) {}

  async create(dto: CreateApplicationDto) {
    // 1. Save the application
    const application = await this.applicationModel.create(dto);

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

    // 4. Send the PDF by email
    await this.emailService.sendApplicationEmail('test@test.com', buffer, filename);

    // 5. Party rules agreement PDF (separate from the application PDF)
    const partyRulesDocument = await this.createPartyRulesDocument(
      dto,
      folder,
    );

    // 6. Return something useful to the frontend
    return {
      id: application._id,
      message: 'Application submitted successfully',
      document,
      partyRulesDocument,
    };
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

      return { publicUrl };
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
