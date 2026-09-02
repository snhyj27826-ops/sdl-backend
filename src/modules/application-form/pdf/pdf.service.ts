import { Injectable } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';
import * as fontkit from '@pdf-lib/fontkit';
import { promises as fs } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { CreateApplicationDto } from '../application-form.dto';

@Injectable()
export class PdfService {
  private createFilename(data: CreateApplicationDto, createdAt: Date): string {
    const date = new Intl.DateTimeFormat('en-CA').format(createdAt);

    const firstName = this.sanitizeFilenamePart(data.firstName);
    const lastName = this.sanitizeFilenamePart(data.lastName);
    const uniqueId = randomUUID();

    return `${firstName}-${lastName}-${date}-${uniqueId}.pdf`;
  }

  private sanitizeFilenamePart(value: string): string {
    return value
      .trim()
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
      .replace(/\s+/g, '-');
  }

  public async generateApplicationPdf(
    data: CreateApplicationDto,
    createdAt: Date,
  ): Promise<{ buffer: Buffer; filename: string }> {
    try {
      const templatePath = join(
        process.cwd(),
        'assets',
        'sdl-pristapnica-sig.pdf',
      );

      const templateBuffer = await fs.readFile(templatePath);

      const pdfDoc = await PDFDocument.load(templateBuffer);

      pdfDoc.registerFontkit(fontkit);

      const form = pdfDoc.getForm();

      const fontPath = join(
        process.cwd(),
        'assets',
        'fonts',
        'NotoSans-Regular.ttf',
      );

      const fontBytes = await fs.readFile(fontPath);

      const font = await pdfDoc.embedFont(fontBytes);

      // Personal information
      form.getTextField('firstName').setText(data.firstName);
      form.getTextField('fathersName').setText(data.fathersName ?? '');
      form.getTextField('lastName').setText(data.lastName);

      // EMБГ - each digit has its own PDF field
      const embg = data.embg ?? '';

      for (let i = 0; i < 13; i++) {
        form.getTextField(`embg_${i}`).setText(embg[i] ?? '');
      }

      // Identification
      form.getTextField('idCardNumber').setText(data.idCardNumber);

      // Contact / address
      form.getTextField('address').setText(data.address);
      form.getTextField('municipality').setText(data.municipality);
      form.getTextField('phone').setText(data.phoneNumber);
      form.getTextField('email').setText(data.email);

      // Education / employment
      form.getTextField('education').setText(data.education);
      form.getTextField('profession').setText(data.profession);
      form.getTextField('employer').setText(data.employer ?? '');
      form.getTextField('workPosition').setText(data.workPosition ?? '');
      form
        .getTextField('employerCompanyName')
        .setText(data.employerCompanyName);

      // Name day
      form.getTextField('nameDay').setText(data.nameDay ?? '');

      // Submission date
      form
        .getTextField('date')
        .setText(new Intl.DateTimeFormat('mk-MK').format(createdAt));

      form.updateFieldAppearances(font);

      await this.populateSignature(pdfDoc, form, data.handwrittenSignature);

      return {
        buffer: Buffer.from(await pdfDoc.save()),
        filename: this.createFilename(data, createdAt),
      };
    } catch (error) {
      console.error('Failed to generate application PDF:', error);
      throw error;
    }
  }

  public async saveApplicationPdf(
    pdfBuffer: Buffer,
    filename: string,
  ): Promise<{ filePath: string; publicUrl: string }> {
    const uploadsDir = join(process.cwd(), 'uploads', 'applications');
    const filePath = join(uploadsDir, filename);

    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(filePath, pdfBuffer);

    return {
      filePath,
      publicUrl: `/uploads/applications/${filename}`,
    };
  }

  private async populateSignature(
    pdfDoc: PDFDocument,
    form: ReturnType<PDFDocument['getForm']>,
    signature: {
      type: 'image' | 'drawn';
      dataUrl: string;
    },
  ): Promise<void> {
    try {
      const signatureField = form.getSignature('handwrittenSignature');

      const widgets = signatureField.acroField.getWidgets();

      if (widgets.length === 0) {
        throw new Error('PDF signature field has no widget.');
      }

      const widget = widgets[0];
      const rectangle = widget.getRectangle();

      const base64Data = signature.dataUrl.split(',')[1];

      if (!base64Data) {
        throw new Error('Invalid signature data URL.');
      }

      const imageBytes = Buffer.from(base64Data, 'base64');

      const image = signature.dataUrl.startsWith('data:image/jpeg')
        ? await pdfDoc.embedJpg(imageBytes)
        : await pdfDoc.embedPng(imageBytes);

      /*
       * Find the page containing the signature widget.
       */
      const pages = pdfDoc.getPages();

      const page = pages.find(
        (page) => widget.getRectangle().x >= 0 && widget.getRectangle().y >= 0,
      );

      if (!page) {
        throw new Error(
          'Could not determine the page containing the signature field.',
        );
      }

      /*
       * Keep the signature's aspect ratio.
       */
      const scale = Math.min(
        rectangle.width / image.width,
        rectangle.height / image.height,
      );

      const width = image.width * scale;
      const height = image.height * scale;

      /*
       * Center the signature inside the field.
       */
      const x = rectangle.x + (rectangle.width - width) / 2;

      const y = rectangle.y + (rectangle.height - height) / 2;

      page.drawImage(image, {
        x,
        y,
        width,
        height,
      });
    } catch (error) {
      console.error('Failed to populate signature field:', error);
      throw error;
    }
  }
}
