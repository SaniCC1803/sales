import { DataSource } from 'typeorm';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CategoriesService } from './categories/categories.service';
import { CreateCategoryDto } from './categories/categories.dto';
import { Category } from './categories/category.entity';
import { CategoryTranslation } from './categories/category-translations.entity';
import { User, Role } from './users/user.entity';
import { CreateUserDto } from './users/users.dto';
import { UsersService } from './users/users.service';
import { Application } from './applications/application.entity';
import { CreateApplicationDto } from './applications/applications.dto';
import { ApplicationsService } from './applications/applications.service';
import { Product } from './products/product.entity';
import { ProductTranslation } from './products/product-translations.entity';
import { ProductsService } from './products/products.service';
import { Language } from './shared-types';

async function seedUsers() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const userRepo = dataSource.getRepository(User);
  const userService = app.get(UsersService);

  // --- CLEAR EXISTING DATA ---
  await userRepo.createQueryBuilder().delete().execute();
  console.log('Database cleared ✅');

  // ---- Users Category ----
  const userDto1: CreateUserDto = {
    email: 'a.gj.sani@gmail.com',
    password: 'sani$123',
    role: Role.SUPERADMIN,
  };
  await userService.create(userDto1);

  const userDto2: CreateUserDto = {
    email: 'sani@codechem.com',
    password: 'sani$123',
    role: Role.USER,
  };
  await userService.create(userDto2);

  console.log('Users seeded ✅');
  await app.close();
}

async function seedApplication() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const applicationRepo = dataSource.getRepository(Application);
  const applicationService = app.get(ApplicationsService);

  // --- CLEAR EXISTING DATA ---
  await applicationRepo.createQueryBuilder().delete().execute();
  console.log('Application database cleared ✅');

  // ---- Single Application ----
  const applicationDto: CreateApplicationDto = {
    logo: 'https://cdn.freebiesupply.com/images/large/2x/google-logo-transparent.png',
    languages: [Language.EN, Language.MK],
    translations: [
      {
        language: Language.EN,
        name: 'Furniture Application',
        description: 'Welcome to furniture application',
      },
      {
        language: Language.MK,
        name: 'Мебел Апликација',
        description: 'Добредојдовте во мебел апликацијата',
      },
    ],
    carousel: [
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80',
    ],
  };

  await applicationService.create(applicationDto);

  console.log('Application seeded ✅');
  await app.close();
}

async function seedCategories() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const categoryRepo = dataSource.getRepository(Category);
  const translationRepo = dataSource.getRepository(CategoryTranslation);
  const productRepo = dataSource.getRepository(Product);
  const productTranslationRepo = dataSource.getRepository(ProductTranslation);
  const categoriesService = app.get(CategoriesService);

  // --- CLEAR EXISTING DATA ---
  // Delete products and their translations first (because of foreign key constraints)
  await productTranslationRepo.createQueryBuilder().delete().execute();
  await productRepo.createQueryBuilder().delete().execute();
  // Then delete category translations and categories
  await translationRepo.createQueryBuilder().delete().execute();
  await categoryRepo.createQueryBuilder().delete().execute();
  console.log('Database cleared ✅');

  // ---- Chairs Category ----
  const chairsDto: CreateCategoryDto = {
    image:
      'https://cdn.decornation.in/wp-content/uploads/2020/07/modern-dining-table-chairs.jpg',
    translations: [
      {
        language: Language.EN,
        name: 'Chairs',
        description: 'Description for chairs',
      },
      {
        language: Language.MK,
        name: 'Столици',
        description: 'Опис за столици',
      },
    ],
  };
  const chairs = await categoriesService.create(chairsDto);

  // ---- Office Chairs ----
  const officeChairsDto: CreateCategoryDto = {
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmm4OL5iy_o4IHf9Pg8xqXoM3_tuzyUNgiWQ&s',
    parentId: chairs.id,
    translations: [
      {
        language: Language.EN,
        name: 'Office Chairs',
        description: 'Description for office chairs',
      },
      {
        language: Language.MK,
        name: 'Канцелариски столици',
        description: 'Опис за канцелариски столици',
      },
    ],
  };
  await categoriesService.create(officeChairsDto);

  // ---- Home Chairs ----
  const homeChairsDto: CreateCategoryDto = {
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8KD6aDINbGiSvZ1XawrlMOqKADn8724aFhw&s',
    parentId: chairs.id,
    translations: [
      {
        language: Language.EN,
        name: 'Home Chairs',
        description: 'Description for home chairs',
      },
      {
        language: Language.MK,
        name: 'Домашни столици',
        description: 'Опис за домашни столици',
      },
    ],
  };
  await categoriesService.create(homeChairsDto);

  // ---- Tables ----
  const tablesDto: CreateCategoryDto = {
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbHDINQF-eylgP8G6X6OG9uEm2Pqray7eYGg&s',
    translations: [
      {
        language: Language.EN,
        name: 'Tables',
        description: 'Description for tables',
      },
      { language: Language.MK, name: 'Маси', description: 'Опис за маси' },
    ],
  };
  const tables = await categoriesService.create(tablesDto);

  // ---- Dining Tables ----
  const diningTablesDto: CreateCategoryDto = {
    image:
      'https://media.ezlivingfurniture.ie/wysiwyg/Blog_Media/dining_table_perfect/mila_dining_table_insta.webp',
    parentId: tables.id,
    translations: [
      {
        language: Language.EN,
        name: 'Dining Tables',
        description: 'Description for dining tables',
      },
      {
        language: Language.MK,
        name: 'Трпезариски Маси',
        description: 'Опис за трпезариски маси',
      },
    ],
  };
  await categoriesService.create(diningTablesDto);

  // ---- Coffee Tables ----
  const coffeeTablesDto: CreateCategoryDto = {
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIyF6c4fXqungMgAMvefOGgISp1z0AAbzBmQ&s',
    parentId: tables.id,
    translations: [
      {
        language: Language.EN,
        name: 'Coffee Tables',
        description: 'Description for coffee tables',
      },
      {
        language: Language.MK,
        name: 'Клуб Маси',
        description: 'Опис за клуб маси',
      },
    ],
  };
  await categoriesService.create(coffeeTablesDto);

  console.log('Categories seeded ✅');
  await app.close();
}

async function seedProducts() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const productsService = app.get(ProductsService);
  const categoryRepo = dataSource.getRepository(Category);

  // Products are already cleared in seedCategories function

  // Get some categories to link products to

  // Find subcategories for seeding
  const officeChairsCategory = await categoryRepo.findOne({ where: { translations: { name: 'Office Chairs' } }, relations: ['translations'] });
  const homeChairsCategory = await categoryRepo.findOne({ where: { translations: { name: 'Home Chairs' } }, relations: ['translations'] });
  const diningTablesCategory = await categoryRepo.findOne({ where: { translations: { name: 'Dining Tables' } }, relations: ['translations'] });
  const coffeeTablesCategory = await categoryRepo.findOne({ where: { translations: { name: 'Coffee Tables' } }, relations: ['translations'] });

  if (!officeChairsCategory || !homeChairsCategory || !diningTablesCategory || !coffeeTablesCategory) {
    console.error('Subcategories not found. Please seed categories first.');
    await app.close();
    return;
  }

  // ---- Office Chairs Products ----
  await productsService.create({
    images: [
      'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg',
      'https://images.pexels.com/photos/1166413/pexels-photo-1166413.jpeg',
    ],
    price: 299.99,
    categoryId: officeChairsCategory.id,
    translations: [
      {
        language: Language.EN,
        name: 'Ergonomic Office Chair',
        description: 'Comfortable office chair with lumbar support',
      },
      {
        language: Language.MK,
        name: 'Ергономска канцелариска столица',
        description: 'Удобна канцелариска столица со поддршка за грбот',
      },
    ],
  });
  await productsService.create({
    images: [
      'https://images.pexels.com/photos/776656/pexels-photo-776656.jpeg',
      'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg',
    ],
    price: 349.99,
    categoryId: officeChairsCategory.id,
    translations: [
      {
        language: Language.EN,
        name: 'Executive Office Chair',
        description: 'Premium executive chair with adjustable height',
      },
      {
        language: Language.MK,
        name: 'Извршна канцелариска столица',
        description: 'Премиум извршна столица со прилагодлива висина',
      },
    ],
  });

  // ---- Dining Tables Products ----
  await productsService.create({
    images: [
      'https://images.pexels.com/photos/1866143/pexels-photo-1866143.jpeg',
      'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg',
    ],
    price: 899.99,
    categoryId: diningTablesCategory.id,
    translations: [
      {
        language: Language.EN,
        name: 'Modern Dining Table',
        description: 'Sleek modern dining table for 6 people',
      },
      {
        language: Language.MK,
        name: 'Модерна трпезариска маса',
        description: 'Елегантна модерна трпезариска маса за 6 лица',
      },
    ],
  });
  await productsService.create({
    images: [
      'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
      'https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg',
    ],
    price: 1099.99,
    categoryId: diningTablesCategory.id,
    translations: [
      {
        language: Language.EN,
        name: 'Classic Dining Table',
        description: 'Classic wooden dining table for family gatherings',
      },
      {
        language: Language.MK,
        name: 'Класична трпезариска маса',
        description: 'Класична дрвена трпезариска маса за семејни собири',
      },
    ],
  });

  // ---- Coffee Tables Product (single, for variety) ----
  await productsService.create({
    images: [
      'https://images.pexels.com/photos/298842/pexels-photo-298842.jpeg',
      'https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg',
    ],
    price: 299.99,
    categoryId: coffeeTablesCategory.id,
    translations: [
      {
        language: Language.EN,
        name: 'Modern Coffee Table',
        description: 'Stylish coffee table for your living room',
      },
      {
        language: Language.MK,
        name: 'Модерна клуб маса',
        description: 'Модерна клуб маса за вашата дневна соба',
      },
    ],
  });

  console.log('Products seeded ✅');
  await app.close();
}

async function seedAll() {
  try {
    await seedUsers();
    await seedApplication();
    await seedCategories();
    await seedProducts();
    console.log('✅ All seeds completed');
  } catch (err) {
    console.error(err);
  }
}

seedAll().catch((err) => console.error(err));
