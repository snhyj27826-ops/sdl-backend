import { IsIn, IsOptional, IsString } from 'class-validator';
import {
  Locale,
  LOCALES,
} from '../../../../common/localization/localization';

export class FindOrganizationMemberByRoleDto {
  @IsOptional()
  @IsIn(LOCALES)
  locale?: Locale;

  @IsString()
  role: string;
}
