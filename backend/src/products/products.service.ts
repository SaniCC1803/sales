import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { ProductTranslation } from './product-translations.entity';
import { Category } from '../categories/category.entity';
import { CreateProductDto, CreateProductTranslationDto } from './products.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async findAll() {
    const products = await this.productRepo.find({
      relations: ['category', 'translations'],
    });
    return products;
  }

  findOne(id: number) {
    return this.productRepo.findOne({
      where: { id },
      relations: ['category', 'translations'],
    });
  }

  async create(dto: CreateProductDto) {
    let category = null;
    if (dto.categoryId) {
      category = await this.categoryRepo.findOne({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new Error(`Category not found. Please select a valid category.`);
      }
    }

    const entity = new Product();

    entity.images =
      dto.images && dto.images.length > 0
        ? dto.images
        : [
            'https://www.shutterstock.com/image-vector/image-icon-trendy-flat-style-600nw-643080895.jpg',
          ];

    entity.price = dto.price;
    entity.category = category;

    entity.translations = dto.translations.map(
      (t: CreateProductTranslationDto) => {
        const translation = new ProductTranslation();
        translation.language = t.language;
        translation.name = t.name;
        translation.description = t.description ?? '';
        return translation;
      },
    );

    return this.productRepo.save(entity);
  }

  async update(
    id: number,
    dto: CreateProductDto,
    files?: Express.Multer.File[],
  ) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['translations'],
    });

    if (!product) {
      throw new Error(`Product with id ${id} not found`);
    }

    let category = null;
    if (dto.categoryId) {
      category = await this.categoryRepo.findOne({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new Error(`Category not found. Please select a valid category.`);
      }
    }

    const fileImages = Array.isArray(files)
      ? files.map((f) => `/uploads/products/${f.filename}`)
      : [];
    if ((dto.images && dto.images.length > 0) || fileImages.length > 0) {
      const allImages = [...(dto.images || []), ...fileImages];
      product.images = Array.from(new Set(allImages));
    }

    product.price = dto.price;
    product.category = category;

    if (dto.translations) {
      product.translations = [];

      // Add new translations
      product.translations = dto.translations.map(
        (t: CreateProductTranslationDto) => {
          const translation = new ProductTranslation();
          translation.language = t.language;
          translation.name = t.name;
          translation.description = t.description ?? '';
          return translation;
        },
      );
    }

    return this.productRepo.save(product);
  }

  remove(id: number) {
    return this.productRepo.delete(id);
  }
}
