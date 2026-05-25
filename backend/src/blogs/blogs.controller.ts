import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { BlogsService } from './blogs.service';
import { CreateBlogDto, UpdateBlogDto } from './blogs.dto';
import { BlogStatus } from './blog.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/user.entity';

const featuredImageStorage = diskStorage({
  destination: (_req, _file, cb) => {
    const uploadPath = './uploads/blogs';
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  async findAll(@Query('published') published?: string) {
    const isPublished = published === 'true';
    return this.blogsService.findAll(isPublished);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const blog = await this.blogsService.findOne(+id);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    return blog;
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const blog = await this.blogsService.findBySlug(slug);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    return blog;
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @UseInterceptors(FileInterceptor('featuredImage', { storage: featuredImageStorage }))
  async create(
    @Body('translations') translationsJson: string,
    @Body('slug') slug: string,
    @Body('status') status: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request & { user: { userId: number } },
  ) {
    try {
      const translations = JSON.parse(
        translationsJson,
      ) as CreateBlogDto['translations'];
      const dto: CreateBlogDto = {
        slug,
        featuredImage: '',
        status: status as BlogStatus | undefined,
        translations,
      };
      return this.blogsService.create(dto, req.user.userId, file);
    } catch {
      throw new Error('Invalid translations format');
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('featuredImage', { storage: featuredImageStorage }))
  async update(
    @Param('id') id: string,
    @Body('translations') translationsJson: string,
    @Body('slug') slug: string,
    @Body('status') status: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request & { user: { id: number } },
  ) {
    try {
      const dto: UpdateBlogDto = {
        slug: slug || undefined,
        status: (status as BlogStatus) || undefined,
        translations: translationsJson
          ? (JSON.parse(translationsJson) as UpdateBlogDto['translations'])
          : undefined,
      };
      return this.blogsService.update(+id, dto, file, req.user.id);
    } catch {
      throw new Error('Invalid translations format');
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  async delete(@Param('id') id: string) {
    await this.blogsService.delete(+id);
    return { message: 'Blog deleted successfully' };
  }
}
