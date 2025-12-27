import { IsNotEmpty, IsNumber, IsPositive, IsOptional, IsArray, ArrayMinSize, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductTranslationDto {
  @IsNotEmpty()
  language!: string;
  
  @IsNotEmpty()
  name!: string;
  
  @IsOptional()
  description?: string;
}

export class CreateProductDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProductTranslationDto)
  translations!: CreateProductTranslationDto[];

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsNumber()
  @Min(1, { message: 'Please select a valid category' })
  categoryId!: number;

  @IsArray()
  @ArrayMinSize(1)
  images!: string[];
}
