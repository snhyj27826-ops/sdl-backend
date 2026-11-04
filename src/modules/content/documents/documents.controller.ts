import { Body, Controller, Post } from '@nestjs/common';
import { FindPublishedDocumentsDto } from './dto/find-published-documents.dto';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  findPublished(@Body() body: FindPublishedDocumentsDto) {
    return this.documentsService.findPublished(body);
  }
}
