import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ApplicationsModule } from './applications/applications.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { BlogsModule } from './blogs/blogs.module';
import { User } from './users/user.entity';
import { AuthModule } from './auth/auth.module';
import { Application } from './applications/application.entity';
import { Category } from './categories/category.entity';
import { Product } from './products/product.entity';
import { Blog } from './blogs/blog.entity';
import { CategoryTranslation } from './categories/category-translations.entity';
import { ApplicationTranslation } from './applications/application-translations.entity';
import { ProductTranslation } from './products/product-translations.entity';
import { BlogTranslation } from './blogs/blog-translations.entity';
import { ContactMessage } from './contact.entity';
import { ContactModule } from './contact.module';
import { OgModule } from './og/og.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '3306', 10),
      username: process.env.DB_USER ?? 'sani',
      password: process.env.DB_PASSWORD ?? 'sani123',
      database: process.env.DB_NAME ?? 'ecom',
      entities: [
        User,
        Application,
        ApplicationTranslation,
        Category,
        CategoryTranslation,
        Product,
        ProductTranslation,
        Blog,
        BlogTranslation,
        ContactMessage,
      ],
      synchronize: true,
    }),
    UsersModule,
    ApplicationsModule,
    CategoriesModule,
    ProductsModule,
    BlogsModule,
    AuthModule,
    ContactModule,
    OgModule,
  ],
})
export class AppModule {}
