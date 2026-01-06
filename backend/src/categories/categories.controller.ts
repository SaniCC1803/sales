import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as path from 'path';
import { Request } from 'express';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './categories.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, StorageEngine } from 'multer';
import { v4 as uuidv4 } from 'uuid';

export const categoryStorage = (): StorageEngine => {
  return diskStorage({
    destination: './uploads/categories',
    filename: (
      _req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void,
    ) => {
      const ext = path.extname(file.originalname);
      const filename = `${uuidv4()}${ext}`;
      cb(null, filename);
    },
  });
};

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getAll() {
    return await this.categoriesService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: number) {
    return this.categoriesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image', { storage: categoryStorage() }))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body('translations') translationsJson: string,
    @Body('parentId') parentId?: string,
  ) {
    try {
      const translationsRaw: unknown = JSON.parse(translationsJson);
      const translations = translationsRaw as CreateCategoryDto['translations'];
      const categoryData: CreateCategoryDto = {
        translations,
        parentId: parentId ? Number(parentId) : undefined,
      };

      return this.categoriesService.create(categoryData, file);
    } catch (error) {
      console.error('Error parsing translations:', error);
      throw new Error('Invalid translations format');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @UseInterceptors(FileInterceptor('image', { storage: categoryStorage() }))
  update(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('translations') translationsJson?: string,
  ) {
    try {
      const updateData: CreateCategoryDto = { translations: [] };
      
      if (translationsJson) {
        const translationsRaw: unknown = JSON.parse(translationsJson);
        updateData.translations = translationsRaw as CreateCategoryDto['translations'];
      }
      
      return this.categoriesService.update(id, updateData, file);
    } catch (error) {
      console.error('Error parsing translations:', error);
      throw new Error('Invalid translations format');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.categoriesService.remove(id);
  }
}
