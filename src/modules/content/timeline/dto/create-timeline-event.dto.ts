import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

class LocalizedTitleDto {
  @IsString()
  @MaxLength(120)
  en: string;

  @IsString()
  @MaxLength(120)
  sr: string;

  @IsString()
  @MaxLength(120)
  mk: string;
}

class LocalizedSubtitleDto {
  @IsString()
  @MaxLength(200)
  en: string;

  @IsString()
  @MaxLength(200)
  sr: string;

  @IsString()
  @MaxLength(200)
  mk: string;
}

class LocalizedDescriptionDto {
  @IsString()
  en: string;

  @IsString()
  sr: string;

  @IsString()
  mk: string;
}

export class CreateTimelineEventDto {
  @IsInt()
  @Min(1900)
  year: number;

  @ValidateNested()
  @Type(() => LocalizedTitleDto)
  title: LocalizedTitleDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedSubtitleDto)
  subtitle?: LocalizedSubtitleDto;

  @ValidateNested()
  @Type(() => LocalizedDescriptionDto)
  description: LocalizedDescriptionDto;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  category?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
