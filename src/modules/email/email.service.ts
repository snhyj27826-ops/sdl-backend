import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly transporter = nodemailer.createTransport({
    host: 'YOUR_SMTP_HOST',
    port: 587,
    secure: false,
    auth: {
      user: 'YOUR_SMTP_USERNAME',
      pass: 'YOUR_SMTP_PASSWORD',
    },
  });

  async sendApplicationEmail(
    to: string,
    pdfBuffer: Buffer,
    filename: string,
  ): Promise<void> {
    await this.transporter.sendMail({
      from: 'YOUR_FROM_EMAIL',
      to,
      subject: 'Application',
      text: 'Please find the application attached.',
      attachments: [
        {
          filename,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  }
}
