import { Injectable } from '@nestjs/common';
import {
  PDFDocument,
  PDFFont,
  PDFPage,
  PDFTextField,
  PDFWidgetAnnotation,
} from 'pdf-lib';
import * as fontkit from '@pdf-lib/fontkit';
import { promises as fs } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

export interface PartyRulesApplicant {
  firstName: string;
  fathersName?: string;
  lastName: string;
  handwrittenSignature: {
    type: 'image' | 'drawn';
    dataUrl: string;
  };
}

// Whatever the applicant has filled in so far; used for the live preview.
export type PartyRulesPreviewInput = Partial<
  Omit<PartyRulesApplicant, 'handwrittenSignature'>
> & {
  handwrittenSignature?: Partial<PartyRulesApplicant['handwrittenSignature']>;
};

export const PARTY_ADDRESS = 'Антон Попов 1/1-1';
export const PARTY_PLACE = 'Скопје';

const TEMPLATE_FILENAME = 'sdl-party-rules-template.pdf';
const OUTPUT_DIR = 'party-rules';
const DEFAULT_FONT_SIZE = 11;

// Field names defined in assets/sdl-party-rules-template.pdf.
const FIELDS = {
  fullName: 'fullName',
  partyAddress: 'partyAddress',
  place: 'signingPlace',
  date: 'dateToday',
  fullNameRepeated: 'fullName1',
  signature: 'signature',
} as const;

@Injectable()
export class PartyRulesPdfService {
  public async generatePartyRulesPdf(
    applicant: PartyRulesApplicant,
    now: number = Date.now(),
  ): Promise<{ buffer: Buffer; filename: string }> {
    return {
      buffer: await this.buildPdf(applicant, now),
      filename: this.createFilename(applicant, now),
    };
  }

  // Same document as the final agreement, but tolerant of a partially filled
  // form. Nothing is stored.
  public generatePartyRulesPreview(
    input: PartyRulesPreviewInput,
    now: number = Date.now(),
  ): Promise<Buffer> {
    return this.buildPdf(input, now);
  }

  private async buildPdf(
    applicant: PartyRulesPreviewInput,
    now: number,
  ): Promise<Buffer> {
    try {
      const templateBuffer = await fs.readFile(
        join(process.cwd(), 'assets', TEMPLATE_FILENAME),
      );
      const fontBytes = await fs.readFile(
        join(process.cwd(), 'assets', 'fonts', 'NotoSans-Regular.ttf'),
      );

      // The template is only ever read; every applicant gets a fresh copy.
      const pdfDoc = await PDFDocument.load(templateBuffer);
      pdfDoc.registerFontkit(fontkit);

      const font = await pdfDoc.embedFont(fontBytes, { subset: false });
      const form = pdfDoc.getForm();

      const fullName = this.formatFullName(applicant);

      this.setFittedText(form.getTextField(FIELDS.fullName), fullName, font);
      form.getTextField(FIELDS.partyAddress).setText(PARTY_ADDRESS);
      form.getTextField(FIELDS.place).setText(PARTY_PLACE);
      form.getTextField(FIELDS.date).setText(this.formatDate(now));
      this.setFittedText(
        form.getTextField(FIELDS.fullNameRepeated),
        fullName,
        font,
      );

      form.updateFieldAppearances(font);

      await this.populateSignature(
        pdfDoc,
        form,
        applicant.handwrittenSignature?.dataUrl,
      );

      return Buffer.from(await pdfDoc.save());
    } catch (error) {
      console.error('Failed to generate party rules PDF:', error);
      throw error;
    }
  }

  public async savePartyRulesPdf(
    pdfBuffer: Buffer,
    filename: string,
  ): Promise<{ filePath: string; publicUrl: string }> {
    const uploadsDir = join(process.cwd(), 'uploads', OUTPUT_DIR);
    const filePath = join(uploadsDir, filename);

    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(filePath, pdfBuffer);

    return {
      filePath,
      publicUrl: `/uploads/${OUTPUT_DIR}/${filename}`,
    };
  }

  // DD/MM/YYYY in the party's timezone, independent of the server timezone.
  public formatDate(timestamp: number): string {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Skopje',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).formatToParts(new Date(timestamp));

    const get = (type: string) =>
      parts.find((part) => part.type === type)?.value ?? '';

    return `${get('day')}/${get('month')}/${get('year')}`;
  }

  // Shrinks the font of long names so they stay fully visible in the field.
  private setFittedText(field: PDFTextField, text: string, font: PDFFont) {
    const [widget] = field.acroField.getWidgets();
    const availableWidth = widget.getRectangle().width - 4;
    const baseSize = DEFAULT_FONT_SIZE;
    const textWidth = font.widthOfTextAtSize(text, baseSize);

    const fontSize =
      textWidth > availableWidth
        ? Math.floor(((baseSize * availableWidth) / textWidth) * 10) / 10
        : baseSize;

    field.setText(text);
    field.setFontSize(fontSize);

    // pdf-lib prefers the widget's own default appearance over the field's.
    for (const widget of field.acroField.getWidgets()) {
      const da = widget.getDefaultAppearance();
      if (da) {
        widget.setDefaultAppearance(
          da.replace(/(\d*\.\d+|\d+)(\s+Tf)/, `${fontSize}$2`),
        );
      }
    }
  }

  private formatFullName(applicant: PartyRulesPreviewInput): string {
    return [applicant.firstName, applicant.fathersName, applicant.lastName]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(' ');
  }

  private createFilename(applicant: PartyRulesApplicant, now: number): string {
    const date = new Intl.DateTimeFormat('en-CA').format(new Date(now));
    const firstName = this.sanitizeFilenamePart(applicant.firstName);
    const lastName = this.sanitizeFilenamePart(applicant.lastName);

    return `party-rules-${firstName}-${lastName}-${date}-${randomUUID()}.pdf`;
  }

  private sanitizeFilenamePart(value: string): string {
    return value
      .trim()
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
      .replace(/\s+/g, '-');
  }

  // Same approach as the application PDF: the signature image is drawn over
  // the signature widget, keeping its aspect ratio and centered in the field.
  private async populateSignature(
    pdfDoc: PDFDocument,
    form: ReturnType<PDFDocument['getForm']>,
    dataUrl: string | undefined,
  ): Promise<void> {
    if (!dataUrl) {
      this.removeSignatureField(pdfDoc, form);
      return;
    }

    const match = /^data:image\/(png|jpe?g);base64,(.+)$/i.exec(dataUrl);

    if (!match) {
      throw new Error('Invalid signature data URL.');
    }

    const imageBytes = Buffer.from(match[2], 'base64');
    const image =
      match[1].toLowerCase() === 'png'
        ? await pdfDoc.embedPng(imageBytes)
        : await pdfDoc.embedJpg(imageBytes);

    const widget = form.getField(FIELDS.signature).acroField.getWidgets()[0];

    if (!widget) {
      throw new Error('PDF signature field has no widget.');
    }

    const page = this.findWidgetPage(pdfDoc, widget);

    if (!page) {
      throw new Error(
        'Could not determine the page containing the signature field.',
      );
    }

    const rectangle = widget.getRectangle();
    const scale = Math.min(
      rectangle.width / image.width,
      rectangle.height / image.height,
    );
    const width = image.width * scale;
    const height = image.height * scale;

    page.drawImage(image, {
      x: rectangle.x + (rectangle.width - width) / 2,
      y: rectangle.y + (rectangle.height - height) / 2,
      width,
      height,
    });

    // The signature now lives in the page content; an empty button widget
    // on top of it would render as a grey box in some viewers.
    this.removeSignatureField(pdfDoc, form);
  }

  private findWidgetPage(
    pdfDoc: PDFDocument,
    widget: PDFWidgetAnnotation,
  ): PDFPage | undefined {
    const widgetRef = pdfDoc.context.getObjectRef(widget.dict);

    return pdfDoc
      .getPages()
      .find((candidate) =>
        candidate.node
          .Annots()
          ?.asArray()
          .some((annot) => annot === widgetRef),
      );
  }

  private removeSignatureField(
    pdfDoc: PDFDocument,
    form: ReturnType<PDFDocument['getForm']>,
  ): void {
    const field = form.getField(FIELDS.signature);
    const widget = field.acroField.getWidgets()[0];
    const page = widget && this.findWidgetPage(pdfDoc, widget);

    if (page) {
      page.node.removeAnnot(pdfDoc.context.getObjectRef(widget.dict)!);
    }

    form.removeField(field);
  }
}
