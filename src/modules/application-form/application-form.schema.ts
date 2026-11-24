import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class Signature {
  @Prop({
    required: true,
    enum: ['image', 'drawn'],
  })
  type: 'image' | 'drawn';

  @Prop({ required: true })
  dataUrl: string;
}

export const SignatureSchema = SchemaFactory.createForClass(Signature);

export type EmailDeliveryStatus = 'pending' | 'sending' | 'sent' | 'failed';

// Tracks the notification email so failed sends can be retried from disk.
@Schema({ _id: false })
export class EmailDelivery {
  @Prop({
    required: true,
    enum: ['pending', 'sending', 'sent', 'failed'],
    default: 'pending',
  })
  status: EmailDeliveryStatus;

  @Prop({ default: 0 })
  attempts: number;

  @Prop()
  lastError?: string;

  // Set once every recipient below has received the email.
  @Prop()
  sentAt?: Date;

  // Tracked per recipient so a retry never re-sends to someone who already
  // received it.
  @Prop()
  partySentAt?: Date;

  @Prop()
  applicantSentAt?: Date;

  @Prop()
  lockedAt?: Date;

  // Paths relative to the uploads folder; the application PDF comes first.
  @Prop({ type: [String], default: [] })
  attachments: string[];
}

export const EmailDeliverySchema = SchemaFactory.createForClass(EmailDelivery);

@Schema({ timestamps: true })
export class ApplicationForm {
  @Prop({ required: true })
  firstName: string;

  @Prop()
  fathersName?: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ match: /^[0-9]{13}$/ })
  embg?: string;

  @Prop()
  idCardNumber: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  municipality: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  education: string;

  @Prop({ required: true })
  profession: string;

  @Prop()
  employer?: string;

  @Prop()
  workPosition?: string;

  @Prop({ required: true })
  employerCompanyName: string;

  @Prop()
  nameDay?: string;

  @Prop({
    type: SignatureSchema,
    required: true,
  })
  handwrittenSignature: Signature;

  @Prop({ required: true })
  consent: boolean;

  @Prop({ type: EmailDeliverySchema })
  delivery?: EmailDelivery;

  createdAt: Date;
  updatedAt: Date;
}

export type ApplicationDocument = HydratedDocument<ApplicationForm>;

export const ApplicationFormSchema =
  SchemaFactory.createForClass(ApplicationForm);
