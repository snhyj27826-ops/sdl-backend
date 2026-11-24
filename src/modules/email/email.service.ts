import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter?: ReturnType<typeof nodemailer.createTransport>;

  constructor(private readonly configService: ConfigService) {}

  private getTransporter() {
    if (!this.transporter) {
      const port = Number(this.configService.getOrThrow<string>('SMTP_PORT'));
      if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error('SMTP_PORT must be a valid TCP port');
      }

      const secureValue = this.configService.getOrThrow<string>('SMTP_SECURE');
      if (secureValue !== 'true' && secureValue !== 'false') {
        throw new Error('SMTP_SECURE must be either true or false');
      }

      this.transporter = nodemailer.createTransport({
        host: this.configService.getOrThrow<string>('SMTP_HOST'),
        port,
        secure: secureValue === 'true',
        auth: {
          user: this.configService.getOrThrow<string>('SMTP_USER'),
          pass: this.configService.getOrThrow<string>('SMTP_PASSWORD'),
        },
      });
    }

    return this.transporter;
  }

  private getFromAddress(): string {
    return this.configService.getOrThrow<string>('SMTP_FROM');
  }

  async sendApplicationEmail(
    to: string,
    pdfBuffer: Buffer,
    filename: string,
    additionalPdfs: { filename: string; content: Buffer }[] = [],
  ): Promise<void> {
    const pdfs = [{ filename, content: pdfBuffer }, ...additionalPdfs];

    await this.getTransporter().sendMail({
      from: this.getFromAddress(),
      to,
      subject: 'Application',
      text:
        pdfs.length > 1
          ? 'Please find the application and the signed party rules agreement attached.'
          : 'Please find the application attached.',
      attachments: pdfs.map((pdf) => ({
        filename: pdf.filename,
        content: pdf.content,
        contentType: 'application/pdf',
      })),
    });
  }

  // Confirmation copy for the applicant, with the same PDFs the party receives.
  async sendApplicantCopyEmail(
    to: string,
    pdfs: { filename: string; content: Buffer }[],
  ): Promise<void> {
    await this.getTransporter().sendMail({
      from: this.getFromAddress(),
      to,
      subject: 'Вашата пристапница во СДЛ',
      text: [
        'Ви благодариме за поднесената пристапница.',
        '',
        pdfs.length > 1
          ? 'Во прилог се Вашата пристапница и потпишаната согласност со Статутот на партијата.'
          : 'Во прилог е Вашата пристапница.',
      ].join('\n'),
      attachments: pdfs.map((pdf) => ({
        filename: pdf.filename,
        content: pdf.content,
        contentType: 'application/pdf',
      })),
    });
  }

  async sendContactEmail(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<void> {
    const subjectLabels: Record<string, string> = {
      general: 'General questions',
      support: 'Technical support',
      collaboration: 'Collaboration',
      feedback: 'Feedback',
    };

    await this.getTransporter().sendMail({
      from: this.getFromAddress(),
      to: 'info@sdl.org.mk',
      replyTo: data.email,
      subject: `Contact form: ${subjectLabels[data.subject]}`,
      text: [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        `Subject: ${subjectLabels[data.subject]}`,
        '',
        'Message:',
        data.message,
      ].join('\n'),
    });
  }
}
