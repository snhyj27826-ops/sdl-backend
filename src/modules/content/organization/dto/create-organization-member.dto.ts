import { IsBoolean, IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { LocalizedTextValue } from '../../../../common/localization/localization';import {
  ORGANIZATION_CATEGORIES,
  OrganizationCategory,
} from '../organization-category';

export class CreateOrganizationMemberDto {
  fullName: LocalizedTextValue;

  role: LocalizedTextValue;

  biography: LocalizedTextValue;

  @IsIn(ORGANIZATION_CATEGORIES)
  category: OrganizationCategory;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
