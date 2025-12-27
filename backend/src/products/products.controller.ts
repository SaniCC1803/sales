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
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductsService } from '../products/products.service';
import { CreateProductDto } from './products.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get() async getAll() {
    return await this.productsService.findAll();
  }
  
  @Get(':id') getOne(@Param('id') id: number) {
    return this.productsService.findOne(id);
  }
  
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            file.fieldname + '-' + uniqueSuffix + extname(file.originalname),
          );
        },
      }),
    }),
  )
  async create(
    @Body('translations') translations: string,
    @Body('price') price: string,
    @Body('categoryId') categoryId: string,
    @Body('images') images: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Validate that categoryId is provided and is a valid number
    const parsedCategoryId = parseInt(categoryId);
    if (!categoryId || isNaN(parsedCategoryId) || parsedCategoryId <= 0) {
      throw new Error('Please select a valid category');
    }

    const dto: CreateProductDto = {
      translations: JSON.parse(translations),
      price: parseFloat(price),
      categoryId: parsedCategoryId,
      images: file ? [`/uploads/products/${file.filename}`] : (images ? JSON.parse(images) : ['https://www.shutterstock.com/image-vector/image-icon-trendy-flat-style-600nw-643080895.jpg']),
    };
    return await this.productsService.create(dto, file);
  }
  
  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            file.fieldname + '-' + uniqueSuffix + extname(file.originalname),
          );
        },
      }),
    }),
  )
  async update(
    @Param('id') id: number,
    @Body('translations') translations: string,
    @Body('price') price: string,
    @Body('categoryId') categoryId: string,
    @Body('images') images: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const dto: CreateProductDto = {
      translations: JSON.parse(translations),
      price: parseFloat(price),
      categoryId: parseInt(categoryId),
      images: file ? [`/uploads/products/${file.filename}`] : (images ? JSON.parse(images) : []),
    };
    return this.productsService.update(id, dto, file);
  }
  
  @Delete(':id') delete(@Param('id') id: number) {
    return this.productsService.remove(id);
  }
}
