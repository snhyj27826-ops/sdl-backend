import { IsIn, IsOptional } from 'class-validator';
import { LOCALES, Locale } from '../../../../common/localization/localization';

export class FindPublishedDocumentsDto {
  @IsOptional()
  @IsIn(LOCALES)
  locale: Locale = 'en';
}
