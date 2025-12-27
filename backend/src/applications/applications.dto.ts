import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Language } from '../shared-types';

export class CreateApplicationTranslationDto {
  @IsNotEmpty()
  language!: Language;

  @IsNotEmpty()
  name!: string;

  @IsOptional()
  description?: string;
}

export class CreateApplicationDto {
  @IsNotEmpty()
  logo!: string;

  @IsArray()
  @IsString({ each: true })
  languages!: string[];

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one translation is required' })
  @ValidateNested({ each: true })
  @Type(() => CreateApplicationTranslationDto)
  translations!: CreateApplicationTranslationDto[];
}
