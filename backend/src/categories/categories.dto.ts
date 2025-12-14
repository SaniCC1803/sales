import {
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Product } from '../products/product.entity';
import { Language } from '../shared-types';

export class CreateCategoryTranslationDto {
  @IsNotEmpty()
  language!: Language;

  @IsNotEmpty()
  name!: string;

  @IsOptional()
  description?: string;
}

export class CreateCategoryDto {
  @IsOptional()
  image?: string;

  @IsOptional()
  parentId?: number;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one translation is required' })
  @ValidateNested({ each: true })
  @Type(() => CreateCategoryTranslationDto)
  translations!: CreateCategoryTranslationDto[];

  @IsOptional()
  @IsArray()
  products?: Product[];
}
