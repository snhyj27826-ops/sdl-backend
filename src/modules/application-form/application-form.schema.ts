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

  createdAt: Date;
  updatedAt: Date;
}

export type ApplicationDocument = HydratedDocument<ApplicationForm>;

export const ApplicationFormSchema =
  SchemaFactory.createForClass(ApplicationForm);
