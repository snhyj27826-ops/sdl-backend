import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { LOCALES, Locale } from '../../../../common/localization/localization';

export class FindPublishedTimelineDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 3;

  @IsOptional()
  @IsIn(LOCALES)
  locale: Locale = 'en';
}
