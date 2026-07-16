import { IsBoolean, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateOrganizationMemberDto {
  @IsString()
  @MaxLength(140)
  fullName: string;

  @IsString()
  @MaxLength(180)
  role: string;

  @IsString()
  biography: string;

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
