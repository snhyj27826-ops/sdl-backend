import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SignatureDto {
  @IsIn(['image', 'drawn'])
  type: 'image' | 'drawn';

  @IsString()
  @IsNotEmpty()
  dataUrl: string;
}

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsOptional()
  @IsString()
  fathersName?: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  @Matches(/^[0-9]{13}$/)
  embg?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  municipality: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  education: string;

  @IsString()
  @IsNotEmpty()
  profession: string;

  @IsOptional()
  @IsString()
  employer?: string;

  @IsOptional()
  @IsString()
  workPosition?: string;

  @IsString()
  @IsNotEmpty()
  employerCompanyName: string;

  @IsOptional()
  @IsString()
  idCardNumber?: string;

  @IsOptional()
  @IsString()
  nameDay?: string;

  @ValidateNested()
  @Type(() => SignatureDto)
  handwrittenSignature: SignatureDto;

  @IsBoolean()
  consent: boolean;
}
