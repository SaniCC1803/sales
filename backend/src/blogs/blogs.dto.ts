import {
  IsEnum,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Language } from '../shared-types';
import { BlogStatus } from './blog.entity';

export class CreateBlogTranslationDto {
  @IsEnum(Language)
  language!: Language;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  @IsOptional()
  excerpt?: string;
}

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsNotEmpty()
  featuredImage!: string;

  @IsEnum(BlogStatus)
  @IsOptional()
  status?: BlogStatus;

  @IsOptional()
  publishedAt?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBlogTranslationDto)
  translations!: CreateBlogTranslationDto[];
}

export class UpdateBlogDto {
  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsNotEmpty()
  featuredImage!: string;

  @IsEnum(BlogStatus)
  @IsOptional()
  status?: BlogStatus;

  @IsOptional()
  publishedAt?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBlogTranslationDto)
  @IsOptional()
  translations?: CreateBlogTranslationDto[];
}
