import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  LocalizedText,
  LocalizedTextValue,
} from '../../../common/localization/localization';

export type OrganizationMemberDocument = OrganizationMember & Document;

export const LocalizedTextSchema = SchemaFactory.createForClass(LocalizedText);

@Schema({
  collection: 'organization_members',
  timestamps: true,
})
export class OrganizationMember {
  @Prop({ type: LocalizedTextSchema, required: true })
  fullName: LocalizedTextValue;

  @Prop({ type: LocalizedTextSchema, required: true })
  role: LocalizedTextValue;

  @Prop({ type: LocalizedTextSchema, required: true })
  biography: LocalizedTextValue;

  @Prop({ trim: true })
  photo?: string;

  @Prop({ default: 0, index: true })
  sortOrder: number;

  @Prop({ default: true, index: true })
  isPublished: boolean;
}

export const OrganizationMemberSchema =
  SchemaFactory.createForClass(OrganizationMember);
