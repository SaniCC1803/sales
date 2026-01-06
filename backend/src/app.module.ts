import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ApplicationsModule } from './applications/applications.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { User } from './users/user.entity';
import { AuthModule } from './auth/auth.module';
import { Application } from './applications/application.entity';
import { Category } from './categories/category.entity';
import { Product } from './products/product.entity';
import { CategoryTranslation } from './categories/category-translations.entity';
import { ApplicationTranslation } from './applications/application-translations.entity';
import { ProductTranslation } from './products/product-translations.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'sani',
      password: 'sani123',
      database: 'ecom',
      entities: [
        User,
        Application,
        ApplicationTranslation,
        Category,
        CategoryTranslation,
        Product,
        ProductTranslation,
      ],
      synchronize: true,
    }),
    UsersModule,
    ApplicationsModule,
    CategoriesModule,
    ProductsModule,
    AuthModule,
  ],
})
export class AppModule {}
