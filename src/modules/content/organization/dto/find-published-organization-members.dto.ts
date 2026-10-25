import { IsIn, IsOptional } from 'class-validator';
import {
  Locale,
  LOCALES,
} from '../../../../common/localization/localization';

export class FindPublishedOrganizationMembersDto {
  @IsOptional()
  @IsIn(LOCALES)
  locale?: Locale;
}
