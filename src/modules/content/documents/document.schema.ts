import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  LocalizedText,
  LocalizedTextValue,
} from '../../../common/localization/localization';

export const DOCUMENT_CATEGORIES = [
  'laws',
  'statute',
  'finance',
  'program',
  'forms',
  'other',
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export type PublicDocumentDocument = PublicDocument & Document;

const LocalizedTextSchema = SchemaFactory.createForClass(LocalizedText);

@Schema({
  collection: 'public_documents',
  timestamps: true,
})
export class PublicDocument {
  // Path relative to the served `uploads` folder (e.g. "documents/statute.pdf") or an absolute URL.
  @Prop({ required: true, trim: true })
  path: string;

  @Prop({ type: LocalizedTextSchema, required: true })
  title: LocalizedTextValue;

  @Prop({ required: true, index: true })
  lastUpdated: Date;

  // File format, e.g. "pdf"
  @Prop({ required: true, trim: true, lowercase: true })
  format: string;

  @Prop({
    type: String,
    enum: DOCUMENT_CATEGORIES,
    default: 'other',
    index: true,
  })
  category: DocumentCategory;

  @Prop({ default: true, index: true })
  isPublished: boolean;
}

export const PublicDocumentSchema = SchemaFactory.createForClass(PublicDocument);
