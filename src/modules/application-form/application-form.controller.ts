import {
  BadRequestException,
  Body,
  Controller,
  Header,
  HttpCode,
  Logger,
  Post,
  StreamableFile,
} from '@nestjs/common';
import {
  CreateApplicationDto,
  PartyRulesPreviewDto,
} from './application-form.dto';
import { ApplicationFormService } from './application-form.service';
import { PartyRulesPdfService } from './party-rules-pdf/party-rules-pdf.service';

@Controller('applications')
export class ApplicationController {
  private readonly logger = new Logger(ApplicationController.name);

  constructor(
    private readonly applicationService: ApplicationFormService,
    private readonly partyRulesPdfService: PartyRulesPdfService,
  ) {}

  @Post('create')
  create(@Body() dto: CreateApplicationDto) {
    return this.applicationService.create(dto);
  }

  // Renders the party rules PDF from the current form state without storing it.
  @Post('party-rules-preview')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  async previewPartyRules(@Body() dto: PartyRulesPreviewDto) {
    try {
      const buffer = await this.partyRulesPdfService.generatePartyRulesPreview(
        dto ?? {},
      );

      return new StreamableFile(buffer, { type: 'application/pdf' });
    } catch (error) {
      this.logger.error(
        'Party rules preview failed',
        error instanceof Error ? error.stack : String(error),
      );
      throw new BadRequestException(
        error instanceof Error && error.message.includes('signature')
          ? error.message
          : 'Could not generate the party rules preview.',
      );
    }
  }
}
