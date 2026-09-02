import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ApplicationController } from './application-form.controller';
import { ApplicationFormService } from './application-form.service';
import {
  ApplicationForm,
  ApplicationFormSchema,
} from './application-form.schema';
import { PdfModule } from './pdf/pdf.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ApplicationForm.name,
        schema: ApplicationFormSchema,
      },
    ]),
    PdfModule,
    EmailModule,
  ],
  controllers: [ApplicationController],
  providers: [ApplicationFormService],
})
export class ApplicationFormModule {}
