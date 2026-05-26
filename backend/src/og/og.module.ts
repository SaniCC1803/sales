import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { OgController } from './og.controller';

@Module({
  imports: [ProductsModule],
  controllers: [OgController],
})
export class OgModule {}
