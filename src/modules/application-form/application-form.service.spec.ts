import { Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { ApplicationFormService } from './application-form.service';

describe('ApplicationFormService', () => {
  const createdAt = new Date(1763583000000);
  const dto = {
    firstName: 'Јован',
    lastName: 'Петровиќ',
    consent: true,
    handwrittenSignature: { type: 'drawn', dataUrl: 'x' },
  } as never;

  const claimedDoc = {
    delivery: {
      attempts: 1,
      attachments: [
        'applications/f/app.pdf',
        'applications/f/party-rules.pdf',
      ],
    },
  };

  const build = (options: { partyRulesFails?: boolean; emailFails?: boolean } = {}) => {
    const pdfService = {
      generateApplicationPdf: jest
        .fn()
        .mockResolvedValue({ buffer: Buffer.from('app'), filename: 'app.pdf' }),
      saveApplicationPdf: jest
        .fn()
        .mockResolvedValue({ publicUrl: '/uploads/applications/f/app.pdf' }),
    };
    const partyRulesPdfService = {
      generatePartyRulesPdf: options.partyRulesFails
        ? jest.fn().mockRejectedValue(new Error('boom'))
        : jest
            .fn()
            .mockResolvedValue({ buffer: Buffer.from('rules'), filename: 'party-rules.pdf' }),
      savePartyRulesPdf: jest.fn().mockResolvedValue({
        publicUrl: '/uploads/applications/f/party-rules.pdf',
      }),
    };
    const emailService = {
      sendApplicationEmail: options.emailFails
        ? jest.fn().mockRejectedValue(new Error('smtp down'))
        : jest.fn().mockResolvedValue(undefined),
    };
    const model = {
      create: jest.fn().mockResolvedValue({ _id: 'id1', createdAt }),
      updateOne: jest.fn().mockResolvedValue({}),
      findOneAndUpdate: jest.fn().mockResolvedValue(claimedDoc),
      find: jest.fn(),
    };
    const service = new ApplicationFormService(
      model as never,
      pdfService as never,
      partyRulesPdfService as never,
      emailService as never,
    );

    return { service, model, pdfService, partyRulesPdfService, emailService };
  };

  beforeEach(() => {
    jest
      .spyOn(fs, 'readFile')
      .mockImplementation(async (path) => Buffer.from(String(path)));
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('stores both files in one folder and emails them to info@sdl.org.mk', async () => {
    const { service, model, pdfService, partyRulesPdfService, emailService } =
      build();

    const result = await service.create(dto);

    const folder = 'Јован-Петровиќ-1763583000000';
    expect(pdfService.saveApplicationPdf).toHaveBeenCalledWith(
      expect.any(Buffer),
      'app.pdf',
      folder,
    );
    expect(partyRulesPdfService.savePartyRulesPdf).toHaveBeenCalledWith(
      expect.any(Buffer),
      'party-rules.pdf',
      folder,
    );
    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({
        delivery: { status: 'pending', attempts: 0, attachments: [] },
      }),
    );
    expect(model.updateOne).toHaveBeenCalledWith(
      { _id: 'id1' },
      {
        $set: {
          'delivery.attachments': [
            'applications/f/app.pdf',
            'applications/f/party-rules.pdf',
          ],
        },
      },
    );
    expect(emailService.sendApplicationEmail).toHaveBeenCalledWith(
      'info@sdl.org.mk',
      expect.any(Buffer),
      'app.pdf',
      [{ filename: 'party-rules.pdf', content: expect.any(Buffer) }],
    );
    expect(model.updateOne).toHaveBeenLastCalledWith(
      { _id: 'id1' },
      expect.objectContaining({
        $set: expect.objectContaining({ 'delivery.status': 'sent' }),
      }),
    );
    expect(result.email).toBe('sent');
    expect(result.partyRulesDocument).toEqual({
      publicUrl: '/uploads/applications/f/party-rules.pdf',
    });
  });

  it('does not fail the submission when the email fails; marks it for retry', async () => {
    const { service, model } = build({ emailFails: true });

    const result = await service.create(dto);

    expect(result.email).toBe('queued');
    expect(model.updateOne).toHaveBeenLastCalledWith(
      { _id: 'id1' },
      expect.objectContaining({
        $set: {
          'delivery.status': 'failed',
          'delivery.lastError': 'smtp down',
        },
      }),
    );
  });

  it('still saves and emails the application when the party rules PDF fails', async () => {
    const { service, model } = build({ partyRulesFails: true });

    const result = await service.create(dto);

    expect(result.partyRulesDocument).toBeNull();
    expect(model.updateOne).toHaveBeenCalledWith(
      { _id: 'id1' },
      { $set: { 'delivery.attachments': ['applications/f/app.pdf'] } },
    );
  });

  it('does not send when another worker already claimed the record', async () => {
    const { service, model, emailService } = build();
    model.findOneAndUpdate.mockResolvedValue(null);

    await expect(service.deliverEmail('id1')).resolves.toBe(false);
    expect(emailService.sendApplicationEmail).not.toHaveBeenCalled();
  });

  it('retries emails that were not delivered', async () => {
    const { service, model, emailService } = build();
    model.find.mockReturnValue({
      sort: () => ({
        limit: () => ({
          select: () => ({
            lean: () => Promise.resolve([{ _id: 'a' }, { _id: 'b' }]),
          }),
        }),
      }),
    });

    await expect(service.retryPendingEmails()).resolves.toBe(2);
    expect(emailService.sendApplicationEmail).toHaveBeenCalledTimes(2);
  });
});
