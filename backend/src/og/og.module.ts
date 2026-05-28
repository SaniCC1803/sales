import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { BlogsModule } from '../blogs/blogs.module';
import { OgController } from './og.controller';
import { BlogOgController } from './blog-og.controller';

@Module({
  imports: [ProductsModule, BlogsModule],
  controllers: [OgController, BlogOgController],
})
export class OgModule {}
