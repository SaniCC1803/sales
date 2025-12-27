import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Category } from '../categories/category.entity';
import {
  CreateCategoryDto,
  CreateCategoryTranslationDto,
} from './categories.dto';
import { CategoryTranslation } from './category-translations.entity';
import { Product } from '../products/product.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async findAll(): Promise<Category[]> {
    const categories = await this.categoryRepo.find({
      where: { parent: IsNull() },
      relations: ['subcategories', 'translations'],
    });

    return categories;
  }

  async findOne(id: number) {
    // Get the category with translations and parent
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['translations', 'parent'],
    });
    if (!category) return null;

    // Get subcategories (direct children)
    const subcategories = await this.categoryRepo.find({
      where: { parent: { id } },
      relations: ['translations'],
    });

    // Get products for this category
    const products = await this.productRepo.find({
      where: { category: { id } },
      relations: ['translations'],
    });

    return { category, subcategories, products };
  }

  async create(dto: CreateCategoryDto, file?: Express.Multer.File) {
    const entity = new Category();
    console.log('dto', dto, file);
    if (file) {
      entity.image = `/uploads/categories/${file.filename}`;
    } else {
      entity.image = dto.image ?? '';
    }
    entity.translations = dto.translations.map(
      (t: CreateCategoryTranslationDto) => {
        const translation = new CategoryTranslation();
        translation.language = t.language;
        translation.name = t.name;
        translation.description = t.description ?? '';
        return translation;
      },
    );

    if (dto.parentId) {
      const parent = await this.categoryRepo.findOne({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new Error(`Parent category with id ${dto.parentId} not found`);
      }
      entity.parent = parent;
    }

    return this.categoryRepo.save(entity);
  }

  async update(id: number, data: CreateCategoryDto, file?: Express.Multer.File) {
    const category = await this.categoryRepo.findOne({ 
      where: { id },
      relations: ['translations']
    });
    
    if (!category) {
      throw new Error(`Category with id ${id} not found`);
    }

    // Update image if file is provided
    if (file) {
      category.image = `/uploads/categories/${file.filename}`;
    }

    // Update translations if provided
    if (data.translations) {
      // Remove existing translations
      category.translations = [];
      
      // Add new translations
      category.translations = data.translations.map((t: any) => {
        const translation = new CategoryTranslation();
        translation.language = t.language;
        translation.name = t.name;
        translation.description = t.description ?? '';
        return translation;
      });
    }

    return this.categoryRepo.save(category);
  }

  remove(id: number) {
    return this.categoryRepo.delete(id);
  }
}
