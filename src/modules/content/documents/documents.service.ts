import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Locale } from '../../../common/localization/localization';
import { CreateDocumentDto } from './dto/create-document.dto';
import { FindPublishedDocumentsDto } from './dto/find-published-documents.dto';
import { PublicDocument, PublicDocumentDocument } from './document.schema';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(PublicDocument.name)
    private readonly documentModel: Model<PublicDocumentDocument>,
  ) {}

  async findPublished({ locale = 'en' }: FindPublishedDocumentsDto) {
    const documents = await this.documentModel
      .find({ isPublished: true })
      .sort({ lastUpdated: -1 })
      .lean<PublicDocument[]>()
      .exec();

    return documents.map((document) => this.localize(document, locale));
  }

  findAll() {
    return this.documentModel.find().sort({ lastUpdated: -1 }).lean().exec();
  }

  create(createDto: CreateDocumentDto) {
    return this.documentModel.create(createDto);
  }

  update(id: string, updateDto: Partial<CreateDocumentDto>) {
    return this.documentModel
      .findByIdAndUpdate(id, updateDto, { new: true, runValidators: true })
      .lean()
      .exec();
  }

  remove(id: string) {
    return this.documentModel.findByIdAndDelete(id).lean().exec();
  }

  private localize(document: PublicDocument, locale: Locale) {
    return { ...document, title: document.title[locale] };
  }
}
