import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { LocalizedTextValue } from './timeline-localization';

export type TimelineEventDocument = TimelineEvent & Document;

@Schema({ _id: false })
export class LocalizedText {
  @Prop({ required: true, trim: true })
  en: string;

  @Prop({ required: true, trim: true })
  sr: string;

  @Prop({ required: true, trim: true })
  mk: string;
}

export const LocalizedTextSchema = SchemaFactory.createForClass(LocalizedText);

@Schema({
  collection: 'timeline_events',
  timestamps: true,
})
export class TimelineEvent {
  @Prop({ required: true, min: 1900 })
  year: number;

  @Prop({ type: LocalizedTextSchema, required: true })
  title: LocalizedTextValue;

  @Prop({ type: LocalizedTextSchema })
  subtitle?: LocalizedTextValue;

  @Prop({ type: LocalizedTextSchema, required: true })
  description: LocalizedTextValue;

  @Prop({ trim: true })
  image?: string;

  @Prop({ trim: true })
  category?: string;

  @Prop({ default: 0, index: true })
  sortOrder: number;

  @Prop({ default: true, index: true })
  isPublished: boolean;
}

export const TimelineEventSchema = SchemaFactory.createForClass(TimelineEvent);
