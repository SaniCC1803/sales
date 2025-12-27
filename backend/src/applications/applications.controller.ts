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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApplicationsService } from './applications.service';
import { Application } from './application.entity';
import { CreateApplicationDto } from './applications.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  async getAll() {
    return await this.applicationsService.findAll();
  }

  @Get('current')
  async getCurrent() {
    // For now, return the first application or null
    // In a real app, you'd get the current user from auth and find their application
    const applications = await this.applicationsService.findAll();
    return applications.length > 0 ? applications[0] : null;
  }

  @Get(':id')
  getOne(@Param('id') id: number) {
    return this.applicationsService.findOne(id);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads/applications',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, 'logo-' + uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async create(
    @Body('translations') translations: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const parsedTranslations = JSON.parse(translations);
    const dto: CreateApplicationDto = {
      logo: file ? `/uploads/applications/${file.filename}` : 'https://www.shutterstock.com/image-vector/image-icon-trendy-flat-style-600nw-643080895.jpg',
      languages: ['en', 'mk'], // Default languages
      translations: parsedTranslations,
    };
    return await this.applicationsService.create(dto);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads/applications',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, 'logo-' + uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async update(
    @Param('id') id: number,
    @Body('translations') translations: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const parsedTranslations = JSON.parse(translations);
    const updateData: any = {
      translations: parsedTranslations,
      languages: ['en', 'mk'], // Default languages
    };
    
    if (file) {
      updateData.logo = `/uploads/applications/${file.filename}`;
    }
    
    return await this.applicationsService.update(id, updateData);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.applicationsService.remove(id);
  }
}
