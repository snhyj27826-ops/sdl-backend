import { Module } from '@nestjs/common';
import { TimelineModule } from './timeline/timeline.module';
import { OrganizationModule } from './organization/organization.module';
import { MediaModule } from './media/media.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [TimelineModule, OrganizationModule, MediaModule, DocumentsModule]
})
export class ContentModule {}
