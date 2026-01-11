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
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor, FilesInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
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
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './uploads/applications',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const prefix = file.fieldname === 'logo' ? 'logo-' : 'carousel-';
          cb(null, prefix + uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async create(
    @Body('translations') translations: string,
    @Body('carousel') carousel: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const parsedTranslations = JSON.parse(translations);
    const parsedCarousel = carousel ? JSON.parse(carousel) : [];
    
    // Find logo file
    const logoFile = files?.find(f => f.fieldname === 'logo');
    // Find carousel files
    const carouselFiles = files?.filter(f => f.fieldname === 'carousel') || [];
    
    // Add uploaded carousel files to the carousel array
    const carouselImages = [
      ...parsedCarousel,
      ...carouselFiles.map(f => `/uploads/applications/${f.filename}`)
    ];
    
    const dto: CreateApplicationDto = {
      logo: logoFile ? `/uploads/applications/${logoFile.filename}` : 'https://www.shutterstock.com/image-vector/image-icon-trendy-flat-style-600nw-643080895.jpg',
      languages: ['en', 'mk'], // Default languages
      translations: parsedTranslations,
      carousel: carouselImages,
    };
    return await this.applicationsService.create(dto);
  }

  @Put(':id')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './uploads/applications',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const prefix = file.fieldname === 'logo' ? 'logo-' : 'carousel-';
          cb(null, prefix + uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async update(
    @Param('id') id: number,
    @Body('translations') translations: string,
    @Body('carousel') carousel: string,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const parsedTranslations = JSON.parse(translations);
    const parsedCarousel = carousel ? JSON.parse(carousel) : [];
    
    // Find logo file
    const logoFile = files?.find(f => f.fieldname === 'logo');
    // Find carousel files
    const carouselFiles = files?.filter(f => f.fieldname === 'carousel') || [];
    
    // Add uploaded carousel files to the carousel array
    const carouselImages = [
      ...parsedCarousel,
      ...carouselFiles.map(f => `/uploads/applications/${f.filename}`)
    ];
    
    const updateData: any = {
      translations: parsedTranslations,
      languages: ['en', 'mk'], // Default languages
      carousel: carouselImages,
    };
    
    if (logoFile) {
      updateData.logo = `/uploads/applications/${logoFile.filename}`;
    }
    
    return await this.applicationsService.update(id, updateData);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.applicationsService.remove(id);
  }
}
