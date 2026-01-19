// Utility to clear all tables before seeding
async function clearDatabase(dataSource: DataSource) {
  // Delete child tables first to avoid FK errors
  await dataSource
    .getRepository(BlogTranslation)
    .createQueryBuilder()
    .delete()
    .execute();
  await dataSource.getRepository(Blog).createQueryBuilder().delete().execute();
  await dataSource
    .getRepository(ProductTranslation)
    .createQueryBuilder()
    .delete()
    .execute();
  await dataSource
    .getRepository(Product)
    .createQueryBuilder()
    .delete()
    .execute();
  await dataSource
    .getRepository(CategoryTranslation)
    .createQueryBuilder()
    .delete()
    .execute();
  await dataSource
    .getRepository(Category)
    .createQueryBuilder()
    .delete()
    .execute();
  await dataSource
    .getRepository(Application)
    .createQueryBuilder()
    .delete()
    .execute();
  // Uncomment these lines if you want to clear users as well
  // await dataSource.getRepository(User).createQueryBuilder().delete().execute();
  console.log('All tables cleared ✅');
}
import { DataSource } from 'typeorm';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CategoriesService } from './categories/categories.service';
import { CreateCategoryDto } from './categories/categories.dto';
import { Category } from './categories/category.entity';
import { CategoryTranslation } from './categories/category-translations.entity';
// import { User, Role } from './users/user.entity';
// import { CreateUserDto } from './users/users.dto';
// import { UsersService } from './users/users.service';
import { Application } from './applications/application.entity';
import { CreateApplicationDto } from './applications/applications.dto';
import { ApplicationsService } from './applications/applications.service';
import { Product } from './products/product.entity';
import { ProductTranslation } from './products/product-translations.entity';
import { ProductsService } from './products/products.service';
import { Blog, BlogStatus } from './blogs/blog.entity';
import { BlogTranslation } from './blogs/blog-translations.entity';
import { BlogsService } from './blogs/blogs.service';
import { User, Role } from './users/user.entity';
import { UsersService } from './users/users.service';
import { Language } from './shared-types';

// async function seedUsers() {
//   const app = await NestFactory.createApplicationContext(AppModule);
//   const dataSource = app.get(DataSource);

//   const userRepo = dataSource.getRepository(User);
//   const userService = app.get(UsersService);

//   // --- CLEAR EXISTING DATA ---
//   await userRepo.createQueryBuilder().delete().execute();
//   console.log('Database cleared ✅');

//   // ---- Users Category ----
//   const userDto1: CreateUserDto = {
//     email: 'a.gj.sani@gmail.com',
//     password: 'sani$123',
//     role: Role.SUPERADMIN,
//   };
//   await userService.create(userDto1);

//   const userDto2: CreateUserDto = {
//     email: 'sani@codechem.com',
//     password: 'sani$123',
//     role: Role.USER,
//   };
//   await userService.create(userDto2);

//   console.log('Users seeded ✅');
//   await app.close();
// }

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
    contactEmail: 'contact@furniture-app.com',
    websiteUrl: 'http://localhost:5173',
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
  const officeChairsCategory = await categoryRepo.findOne({
    where: { translations: { name: 'Office Chairs' } },
    relations: ['translations'],
  });
  const homeChairsCategory = await categoryRepo.findOne({
    where: { translations: { name: 'Home Chairs' } },
    relations: ['translations'],
  });
  const diningTablesCategory = await categoryRepo.findOne({
    where: { translations: { name: 'Dining Tables' } },
    relations: ['translations'],
  });
  const coffeeTablesCategory = await categoryRepo.findOne({
    where: { translations: { name: 'Coffee Tables' } },
    relations: ['translations'],
  });

  if (
    !officeChairsCategory ||
    !homeChairsCategory ||
    !diningTablesCategory ||
    !coffeeTablesCategory
  ) {
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

async function seedBlogs() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const blogRepo = dataSource.getRepository(Blog);
  const blogTranslationRepo = dataSource.getRepository(BlogTranslation);
  const userRepo = dataSource.getRepository(User);
  const blogsService = app.get(BlogsService);

  // Clear existing blogs
  await blogTranslationRepo.createQueryBuilder().delete().execute();
  await blogRepo.createQueryBuilder().delete().execute();
  console.log('Blog database cleared ✅');

  // Get the first user to be the author (create one if none exists)
  let author = await userRepo.findOne({ where: {} });
  if (!author) {
    const userService = app.get(UsersService);
    author = await userService.create({
      email: 'blog@example.com',
      password: 'password123',
      role: Role.SUPERADMIN,
    });
  }

  // Blog 1: Welcome Post
  await blogsService.create(
    {
      slug: 'welcome-to-our-blog',
      status: BlogStatus.PUBLISHED,
      featuredImage:
        'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80',
      translations: [
        {
          language: Language.EN,
          title: 'Welcome to Our Blog!',
          content: `<h2>Hello and welcome!</h2>
<p>We're excited to launch our new blog where we'll be sharing the latest updates about our furniture collection, design tips, and industry insights.</p>

<p>Our team is passionate about creating beautiful, functional furniture that transforms your living spaces. Whether you're looking for modern office chairs, cozy home seating, or stylish tables, we've got you covered.</p>

<h3>What to Expect</h3>
<ul>
  <li>Product spotlights and new arrivals</li>
  <li>Interior design tips and trends</li>
  <li>Behind-the-scenes content</li>
  <li>Customer stories and testimonials</li>
</ul>

<p>Stay tuned for more exciting content!</p>`,
          excerpt:
            "Welcome to our new blog! We're excited to share furniture insights, design tips, and product updates with you.",
        },
        {
          language: Language.MK,
          title: 'Добредојдовте на нашиот блог!',
          content: `<h2>Здраво и добредојдовте!</h2>
<p>Возбудени сме што го лансираме нашиот нов блог каде ќе споделуваме најнови вести за нашата колекција мебел, совети за дизајн и увиди од индустријата.</p>

<p>Нашиот тим е страстен за креирање убав, функционален мебел што ги трансформира вашите животни простори.</p>

<h3>Што да очекувате</h3>
<ul>
  <li>Презентации на производи и нови пристигнувања</li>
  <li>Совети и трендови за ентериер дизајн</li>
  <li>Содржини од позадината</li>
  <li>Приказни и препораки од клиенти</li>
</ul>

<p>Останете со нас за повеќе возбудлива содржина!</p>`,
          excerpt:
            'Добредојдовте на нашиот нов блог! Возбудени сме да споделуваме увиди за мебел и совети за дизајн.',
        },
      ],
    },
    author.id,
  );

  // Blog 2: Design Trends
  await blogsService.create(
    {
      slug: 'furniture-trends-2026',
      status: BlogStatus.PUBLISHED,
      featuredImage:
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
      translations: [
        {
          language: Language.EN,
          title: "2026 Furniture Trends: What's Hot This Year",
          content: `<h2>The Latest in Furniture Design</h2>
<p>2026 brings exciting new trends in furniture design that blend comfort, sustainability, and style. Here are the top trends we're seeing this year:</p>

<h3>1. Sustainable Materials</h3>
<p>Eco-friendly furniture made from recycled and renewable materials is becoming increasingly popular. Look for pieces made from reclaimed wood, bamboo, and recycled plastics.</p>

<h3>2. Curved and Organic Shapes</h3>
<p>Goodbye sharp edges! This year is all about soft, flowing lines that create a sense of calm and comfort in your space.</p>

<h3>3. Bold Colors</h3>
<p>While neutral tones remain classic, we're seeing more homeowners embrace bold, statement colors like deep emerald green, rich burgundy, and vibrant blues.</p>

<h3>4. Multi-functional Furniture</h3>
<p>As homes become more compact, furniture that serves multiple purposes is essential. Think storage ottomans, extendable dining tables, and convertible sofas.</p>

<p>Which trend excites you the most? Let us know!</p>`,
          excerpt:
            'Discover the hottest furniture trends for 2026, from sustainable materials to bold colors and multi-functional designs.',
        },
        {
          language: Language.MK,
          title: 'Трендови во мебел 2026: Што е актуелно оваа година',
          content: `<h2>Најновото во дизајнот на мебел</h2>
<p>2026 година донесува возбудливи нови трендови во дизајнот на мебел што ги комбинираат удобноста, одржливоста и стилот.</p>

<h3>1. Одржливи материјали</h3>
<p>Еколошки мебел изработен од рециклирани и обновливи материјали станува сè попопуларен.</p>

<h3>2. Заоблени и органски форми</h3>
<p>Збогум остри рабови! Оваа година е во знак на мекі, тековни линии што создаваат чувство на мир и удобност.</p>

<h3>3. Смели бои</h3>
<p>Додека неутралните тонови остануваат класични, гледаме повеќе домаќини што прифаќаат смели, изразити бои.</p>

<h3>4. Мултифункционален мебел</h3>
<p>Како домовите стануваат покомпактни, мебелот што служи повеќе цели е неопходен.</p>`,
          excerpt:
            'Откријте ги најжешките трендови во мебел за 2026, од одржливи материјали до смели бои.',
        },
      ],
    },
    author.id,
  );

  // Blog 3: Office Setup
  await blogsService.create(
    {
      slug: 'create-perfect-home-office',
      status: BlogStatus.DRAFT,
      featuredImage:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      translations: [
        {
          language: Language.EN,
          title: 'Creating the Perfect Home Office Setup',
          content: `<h2>Your Guide to a Productive Workspace</h2>
<p>With remote work becoming the norm, creating a comfortable and productive home office is more important than ever. Here's how to set up the perfect workspace:</p>

<h3>Choose the Right Desk</h3>
<p>Your desk is the foundation of your home office. Look for one that's the right height and has enough surface area for your computer, documents, and other essentials.</p>

<h3>Invest in a Good Chair</h3>
<p>You'll be sitting for hours, so comfort is key. Look for ergonomic chairs with proper lumbar support and adjustable height.</p>

<h3>Lighting Matters</h3>
<p>Natural light is best, but if that's not available, invest in good task lighting to reduce eye strain.</p>

<h3>Organization is Key</h3>
<p>Keep your space organized with storage solutions like filing cabinets, desk organizers, and shelving.</p>

<p>Remember, your home office should be a space that inspires productivity and creativity!</p>`,
          excerpt:
            'Learn how to create a comfortable and productive home office with the right furniture and setup.',
        },
        {
          language: Language.MK,
          title: 'Креирање на совршениот домашен офис',
          content: `<h2>Ваш водич за продуктивен работен простор</h2>
<p>Со работата од дома која станува норма, креирањето удобен и продуктивен домашен офис е поважно од кога било.</p>

<h3>Изберете го правилниот биро</h3>
<p>Вашиот биро е основата на вашиот домашен офис. Барајте таков што е со правилна висина и има доволно површина.</p>

<h3>Инвестирајте во добра столица</h3>
<p>Ќе седите часови, па удобноста е клучна. Барајте ергономски столици со соодветна поддршка.</p>

<h3>Осветлувањето е важно</h3>
<p>Природната светлина е најдобра, но ако не е достапна, инвестирајте во добро осветлување.</p>

<p>Запомнете, вашиот домашен офис треба да биде простор што инспирира продуктивност!</p>`,
          excerpt:
            'Научете како да креирате удобен и продуктивен домашен офис со правилниот мебел.',
        },
      ],
    },
    author.id,
  );

  console.log('Blogs seeded ✅');
  await app.close();
}

async function seedAll() {
  try {
    // Create app context just for clearing
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);
    await clearDatabase(dataSource);
    await app.close();

    // Now run the actual seeders
    // await seedUsers();
    await seedApplication();
    await seedCategories();
    await seedProducts();
    await seedBlogs();
    console.log('✅ All seeds completed');
  } catch (err) {
    console.error(err);
  }
}

seedAll().catch((err) => console.error(err));
