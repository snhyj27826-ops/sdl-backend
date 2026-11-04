import { Module } from '@nestjs/common';
import { ContentAdminController } from './content-admin.controller';
import { ContentAdminService } from './content-admin.service';
import { OrganizationModule } from '../content/organization/organization.module';
import { TimelineModule } from '../content/timeline/timeline.module';
import { DocumentsModule } from '../content/documents/documents.module';

@Module({
  imports: [TimelineModule, OrganizationModule, DocumentsModule],
  controllers: [ContentAdminController],
  providers: [ContentAdminService],
})
export class ContentAdminModule {}
