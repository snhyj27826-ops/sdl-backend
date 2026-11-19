import { Module } from '@nestjs/common';
import { PartyRulesPdfService } from './party-rules-pdf.service';

@Module({
  providers: [PartyRulesPdfService],
  exports: [PartyRulesPdfService],
})
export class PartyRulesPdfModule {}
