import { IsIn, IsMongoId, IsOptional, ValidateIf } from 'class-validator';
import {
  Locale,
  LOCALES,
} from '../../../../common/localization/localization';
import {
  ORGANIZATION_CATEGORIES,
  OrganizationCategory,
} from '../organization-category';

export class FindOrganizationMemberDto {
  @IsOptional()
  @IsIn(LOCALES)
  locale?: Locale;

  @ValidateIf((o: FindOrganizationMemberDto) => !o.id)
  @IsIn(ORGANIZATION_CATEGORIES)
  category?: OrganizationCategory;

  @ValidateIf((o: FindOrganizationMemberDto) => !o.category)
  @IsMongoId()
  id?: string;
}
