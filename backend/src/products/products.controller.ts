import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { Product } from './product.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get() async getAll() {
    return await this.productsService.findAll();
  }
  @Get(':id') getOne(@Param('id') id: number) {
    return this.productsService.findOne(id);
  }
  @Post() async create(@Body() data: Partial<Product>) {
    return await this.productsService.create(data);
  }
  @Put(':id') update(@Param('id') id: number, @Body() data: Partial<Product>) {
    return this.productsService.update(id, data);
  }
  @Delete(':id') delete(@Param('id') id: number) {
    return this.productsService.remove(id);
  }
}
