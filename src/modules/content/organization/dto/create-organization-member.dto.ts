import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { LocalizedTextValue } from '../../../../common/localization/localization';
import {
  ORGANIZATION_CATEGORIES,
  OrganizationCategory,
} from '../organization-category';

export class CreateOrganizationMemberDto {
  fullName: LocalizedTextValue;

  profession: LocalizedTextValue;

  biography: LocalizedTextValue;

  @IsArray()
  @ArrayNotEmpty()
  @IsIn(ORGANIZATION_CATEGORIES, { each: true })
  category: OrganizationCategory[];

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
