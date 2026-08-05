import { Prop, Schema } from '@nestjs/mongoose';

export const LOCALES = ['en', 'sr', 'mk'] as const;

export type Locale = (typeof LOCALES)[number];

export type LocalizedTextValue = Record<Locale, string>;

export function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}

@Schema({ _id: false })
export class LocalizedText {
  @Prop({ required: true, trim: true })
  en: string;

  @Prop({ required: true, trim: true })
  sr: string;

  @Prop({ required: true, trim: true })
  mk: string;
}
