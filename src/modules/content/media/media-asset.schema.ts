import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MediaAssetDocument = MediaAsset & Document;

@Schema({
  collection: 'media_assets',
  timestamps: true,
})
export class MediaAsset {
  @Prop({ required: true, trim: true })
  url: string;

  @Prop({ trim: true })
  alt?: string;

  @Prop({ trim: true })
  mimeType?: string;

  @Prop({ trim: true })
  purpose?: string;
}

export const MediaAssetSchema = SchemaFactory.createForClass(MediaAsset);
