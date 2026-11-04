import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import {
  DOCUMENT_CATEGORIES,
  DocumentCategory,
} from '../document.schema';

class LocalizedDocumentTitleDto {
  @IsString()
  @MaxLength(250)
  en: string;

  @IsString()
  @MaxLength(250)
  sr: string;

  @IsString()
  @MaxLength(250)
  mk: string;
}

export class CreateDocumentDto {
  @IsString()
  @MaxLength(500)
  path: string;

  @ValidateNested()
  @Type(() => LocalizedDocumentTitleDto)
  title: LocalizedDocumentTitleDto;

  @IsDateString()
  lastUpdated: string;

  @IsString()
  @MaxLength(20)
  format: string;

  @IsOptional()
  @IsIn(DOCUMENT_CATEGORIES)
  category?: DocumentCategory;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
