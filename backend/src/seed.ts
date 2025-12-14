import { DataSource } from 'typeorm';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CategoriesService } from './categories/categories.service';
import { CreateCategoryDto } from './categories/categories.dto';
import { Category } from './categories/category.entity';
import { CategoryTranslation } from './categories/category-translations.entity';
import { User } from './users/user.entity';
import { CreateUserDto } from './users/users.dto';
import { UsersService } from './users/users.service';
import { Application } from './applications/application.entity';
import { CreateApplicationDto } from './applications/applications.dto';
import { ApplicationsService } from './applications/applications.service';
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
  };
  await userService.create(userDto1);

  const userDto2: CreateUserDto = {
    email: 'sani@codechem.com',
    password: 'sani$123',
  };
  await userService.create(userDto2);

  console.log('Users seeded ✅');
  await app.close();
}

async function seedApplications() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const applicationRepo = dataSource.getRepository(Application);
  const applicationService = app.get(ApplicationsService);

  // --- CLEAR EXISTING DATA ---
  await applicationRepo.createQueryBuilder().delete().execute();
  console.log('Database cleared ✅');

  // ---- Applications Category ----
  const applicationDto1: CreateApplicationDto = {
    owner: { email: 'a.gj.sani@gmail.com' },
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
  };
  await applicationService.create(applicationDto1);

  const applicationDto2: CreateApplicationDto = {
    owner: { email: 'sani@codechem.com' },
    logo: 'https://cdn.freebiesupply.com/images/large/2x/google-logo-transparent.png',
    languages: [Language.EN],
    translations: [
      {
        language: Language.EN,
        name: 'Groceries Application',
        description: 'Welcome to groceries application',
      },
      {
        language: Language.MK,
        name: 'Апликација за намирници',
        description: 'Добредојдовте во апликацијата за намирници',
      },
    ],
  };
  await applicationService.create(applicationDto2);

  console.log('Applications seeded ✅');
  await app.close();
}

async function seedCategories() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const categoryRepo = dataSource.getRepository(Category);
  const translationRepo = dataSource.getRepository(CategoryTranslation);
  const categoriesService = app.get(CategoriesService);

  // --- CLEAR EXISTING DATA ---
  // Delete translations first (because of foreign key constraints)
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

async function seedAll() {
  try {
    await seedUsers();
    await seedApplications();
    await seedCategories();
    console.log('✅ All seeds completed');
  } catch (err) {
    console.error(err);
  }
}

seedAll().catch((err) => console.error(err));
