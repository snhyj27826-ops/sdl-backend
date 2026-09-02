import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { EmailService } from '../email/email.service';
import {
  ApplicationDocument,
  ApplicationForm,
} from './application-form.schema';
import { PdfService } from './pdf/pdf.service';
import { CreateApplicationDto } from './application-form.dto';

@Injectable()
export class ApplicationFormService {
  constructor(
    @InjectModel(ApplicationForm.name)
    private readonly applicationModel: Model<ApplicationDocument>,

    private readonly pdfService: PdfService,

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

    // 3. Save the PDF on disk
    const document = await this.pdfService.saveApplicationPdf(buffer, filename);

    // 4. Send the PDF by email
    await this.emailService.sendApplicationEmail('test@test.com', buffer, filename);

    // 5. Return something useful to the frontend
    return {
      id: application._id,
      message: 'Application submitted successfully',
      document,
    };
  }
}
