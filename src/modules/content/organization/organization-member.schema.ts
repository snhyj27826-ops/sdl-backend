import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrganizationMemberDocument = OrganizationMember & Document;

@Schema({
  collection: 'organization_members',
  timestamps: true,
})
export class OrganizationMember {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, trim: true })
  role: string;

  @Prop({ required: true, trim: true })
  biography: string;

  @Prop({ trim: true })
  photo?: string;

  @Prop({ default: 0, index: true })
  sortOrder: number;

  @Prop({ default: true, index: true })
  isPublished: boolean;
}

export const OrganizationMemberSchema = SchemaFactory.createForClass(OrganizationMember);
