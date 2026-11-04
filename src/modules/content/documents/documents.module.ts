import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { PublicDocument, PublicDocumentSchema } from './document.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PublicDocument.name, schema: PublicDocumentSchema },
    ]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
