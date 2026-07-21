import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { LocalizedTextValue } from '../../../../common/localization/localization';

export class CreateOrganizationMemberDto {
  fullName: LocalizedTextValue;

  role: LocalizedTextValue;

  biography: LocalizedTextValue;

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
