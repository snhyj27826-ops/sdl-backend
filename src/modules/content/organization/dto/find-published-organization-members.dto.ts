import { IsIn, IsOptional } from 'class-validator';
import {
  Locale,
  LOCALES,
} from '../../../../common/localization/localization';
import {
  ORGANIZATION_CATEGORIES,
  OrganizationCategory,
} from '../organization-category';

export class FindPublishedOrganizationMembersDto {
  @IsOptional()
  @IsIn(LOCALES)
  locale?: Locale;

  @IsOptional()
  @IsIn(ORGANIZATION_CATEGORIES)
  category?: OrganizationCategory;
}
