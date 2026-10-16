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
  ): Promise<void> {
    await this.getTransporter().sendMail({
      from: this.getFromAddress(),
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
