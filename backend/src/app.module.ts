import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  imports: [
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60_000, limit: 60 },
      { name: 'auth', ttl: 60_000, limit: 5 },
    ]),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
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
  ],
})
export class AppModule {}
