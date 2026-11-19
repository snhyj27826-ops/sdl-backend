import { PDFDocument } from 'pdf-lib';
import { promises as fs } from 'fs';
import { join } from 'path';
import {
  PARTY_ADDRESS,
  PARTY_PLACE,
  PartyRulesPdfService,
} from './party-rules-pdf.service';

// Hand drawn style signature, 800x200 transparent PNG (as produced by the form canvas).
const SIGNATURE_DATA_URL =
  'data:image/png;base64,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';

describe('PartyRulesPdfService', () => {
  const service = new PartyRulesPdfService();
  const templatePath = join(
    process.cwd(),
    'assets',
    'sdl-party-rules-template.pdf',
  );

  const applicant = {
    firstName: 'Јован',
    fathersName: 'Марко',
    lastName: 'Петровиќ',
    handwrittenSignature: {
      type: 'drawn' as const,
      dataUrl: SIGNATURE_DATA_URL,
    },
  };

  it('formats the date as DD/MM/YYYY with leading zeros', () => {
    expect(service.formatDate(Date.UTC(2026, 10, 19, 12))).toBe('19/11/2026');
    expect(service.formatDate(Date.UTC(2026, 0, 5, 12))).toBe('05/01/2026');
  });

  it('populates all fields and embeds the signature', async () => {
    const templateBefore = await fs.readFile(templatePath);
    const now = Date.UTC(2026, 10, 19, 12);

    const { buffer, filename } = await service.generatePartyRulesPdf(
      applicant,
      now,
    );

    const form = (await PDFDocument.load(buffer)).getForm();
    expect(form.getTextField('fullName').getText()).toBe('Јован Марко Петровиќ');
    expect(form.getTextField('fullName1').getText()).toBe(
      'Јован Марко Петровиќ',
    );
    expect(form.getTextField('partyAddress').getText()).toBe(PARTY_ADDRESS);
    expect(form.getTextField('signingPlace').getText()).toBe(PARTY_PLACE);
    expect(form.getTextField('dateToday').getText()).toBe('19/11/2026');
    expect(PARTY_ADDRESS).toBe('Антон Попов 1/1-1');
    expect(PARTY_PLACE).toBe('Скопје');
    expect(filename).toMatch(/^party-rules-.+-2026-11-19-.+\.pdf$/);

    // The template must never be modified.
    expect(await fs.readFile(templatePath)).toEqual(templateBefore);
    const template = (await PDFDocument.load(templateBefore)).getForm();
    expect(template.getTextField('fullName').getText()).toBeUndefined();
  });

  it('renders a preview from a partially filled form', async () => {
    const buffer = await service.generatePartyRulesPreview(
      { firstName: 'Јован' },
      Date.UTC(2026, 10, 19, 12),
    );

    const doc = await PDFDocument.load(buffer);
    const form = doc.getForm();
    expect(form.getTextField('fullName').getText()).toBe('Јован');
    expect(form.getTextField('dateToday').getText()).toBe('19/11/2026');
    expect(form.getFields().map((field) => field.getName())).not.toContain(
      'signature',
    );
    expect(doc.getPageCount()).toBe(2);
  });

  it('renders a preview with an empty form', async () => {
    const buffer = await service.generatePartyRulesPreview({});

    const form = (await PDFDocument.load(buffer)).getForm();
    expect(form.getTextField('fullName').getText() ?? '').toBe('');
    expect(form.getTextField('partyAddress').getText()).toBe(PARTY_ADDRESS);
  });

  it('saves the PDF in the given application folder', async () => {
    const { buffer, filename } = await service.generatePartyRulesPdf(applicant);
    const folder = 'test-folder-1763583000000';
    const { filePath, publicUrl } = await service.savePartyRulesPdf(
      buffer,
      filename,
      folder,
    );

    try {
      expect(filePath).toBe(
        join(process.cwd(), 'uploads', 'applications', folder, filename),
      );
      expect(publicUrl).toBe(`/uploads/applications/${folder}/${filename}`);
      expect(await fs.readFile(filePath)).toEqual(buffer);
    } finally {
      await fs.rm(join(process.cwd(), 'uploads', 'applications', folder), {
        recursive: true,
        force: true,
      });
    }
  });

  it('rejects an invalid signature', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(
      service.generatePartyRulesPdf({
        ...applicant,
        handwrittenSignature: { type: 'drawn', dataUrl: 'nope' },
      }),
    ).rejects.toThrow('Invalid signature data URL.');
  });
});
