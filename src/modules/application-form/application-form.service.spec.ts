import { ApplicationFormService } from './application-form.service';

describe('ApplicationFormService.create', () => {
  const createdAt = new Date(1763583000000);
  const dto = {
    firstName: 'Јован',
    lastName: 'Петровиќ',
    consent: true,
    handwrittenSignature: { type: 'drawn', dataUrl: 'x' },
  } as never;

  const build = (partyRulesFails = false) => {
    const pdf = Buffer.from('app');
    const rules = Buffer.from('rules');
    const pdfService = {
      generateApplicationPdf: jest
        .fn()
        .mockResolvedValue({ buffer: pdf, filename: 'app.pdf' }),
      saveApplicationPdf: jest.fn().mockResolvedValue({ publicUrl: '/a' }),
    };
    const partyRulesPdfService = {
      generatePartyRulesPdf: partyRulesFails
        ? jest.fn().mockRejectedValue(new Error('boom'))
        : jest.fn().mockResolvedValue({ buffer: rules, filename: 'rules.pdf' }),
      savePartyRulesPdf: jest.fn().mockResolvedValue({ publicUrl: '/r' }),
    };
    const emailService = { sendApplicationEmail: jest.fn() };
    const model = { create: jest.fn().mockResolvedValue({ _id: 1, createdAt }) };
    const service = new ApplicationFormService(
      model as never,
      pdfService as never,
      partyRulesPdfService as never,
      emailService as never,
    );

    return { service, pdfService, partyRulesPdfService, emailService, pdf, rules };
  };

  it('emails both PDFs to info@sdl.org.mk and uses one folder', async () => {
    const { service, emailService, pdfService, partyRulesPdfService, pdf, rules } =
      build();

    const result = await service.create(dto);

    const folder = 'Јован-Петровиќ-1763583000000';
    expect(pdfService.saveApplicationPdf).toHaveBeenCalledWith(
      pdf,
      'app.pdf',
      folder,
    );
    expect(partyRulesPdfService.savePartyRulesPdf).toHaveBeenCalledWith(
      rules,
      'rules.pdf',
      folder,
    );
    expect(emailService.sendApplicationEmail).toHaveBeenCalledWith(
      'info@sdl.org.mk',
      pdf,
      'app.pdf',
      [{ filename: 'rules.pdf', content: rules }],
    );
    expect(result.partyRulesDocument).toEqual({ publicUrl: '/r' });
  });

  it('still emails the application when the party rules PDF fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const { service, emailService, pdf } = build(true);

    const result = await service.create(dto);

    expect(emailService.sendApplicationEmail).toHaveBeenCalledWith(
      'info@sdl.org.mk',
      pdf,
      'app.pdf',
      [],
    );
    expect(result.partyRulesDocument).toBeNull();
  });
});
