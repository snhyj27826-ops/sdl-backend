import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TimelineEventDocument = TimelineEvent & Document;

@Schema({
  collection: 'timeline_events',
  timestamps: true,
})
export class TimelineEvent {
  @Prop({ required: true, min: 1900 })
  year: number;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  subtitle?: string;

  @Prop({ required: true, trim: true })
  description: string;

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
