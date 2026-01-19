import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog, BlogStatus } from './blog.entity';
import { BlogTranslation } from './blog-translations.entity';
import {
  CreateBlogDto,
  UpdateBlogDto,
  CreateBlogTranslationDto,
} from './blogs.dto';
import { User } from '../users/user.entity';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepo: Repository<Blog>,
    @InjectRepository(BlogTranslation)
    private readonly blogTranslationRepo: Repository<BlogTranslation>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll(published?: boolean): Promise<Blog[]> {
    const queryBuilder = this.blogRepo
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.translations', 'translations')
      .leftJoinAndSelect('blog.author', 'author')
      .orderBy('blog.publishedAt', 'DESC');

    if (published) {
      queryBuilder.where('blog.status = :status', {
        status: BlogStatus.PUBLISHED,
      });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Blog | null> {
    const blog = await this.blogRepo.findOne({
      where: { id },
      relations: ['translations', 'author'],
    });
    return blog;
  }

  async findBySlug(slug: string): Promise<Blog | null> {
    const blog = await this.blogRepo.findOne({
      where: { slug },
      relations: ['translations', 'author'],
    });
    return blog;
  }

  async create(
    dto: CreateBlogDto,
    authorId: number,
    file?: Express.Multer.File,
  ): Promise<Blog> {
    const author = await this.userRepo.findOne({ where: { id: authorId } });
    if (!author) {
      throw new NotFoundException('Author not found');
    }

    const blog = new Blog();
    blog.slug = dto.slug;
    blog.author = author;
    blog.status = dto.status ?? BlogStatus.DRAFT;

    if (file) {
      blog.featuredImage = `/uploads/blogs/${file.filename}`;
    } else if (dto.featuredImage) {
      blog.featuredImage = dto.featuredImage;
    }

    if (!Array.isArray(dto.translations)) {
      throw new Error('Translations is not an array at create');
    }

    blog.translations = dto.translations.map((t: CreateBlogTranslationDto) => {
      const translation = new BlogTranslation();
      translation.language = t.language;
      translation.title = t.title;
      translation.content = t.content;
      translation.excerpt = t.excerpt;
      return translation;
    });

    return this.blogRepo.save(blog);
  }

  async update(
    id: number,
    dto: UpdateBlogDto,
    file?: Express.Multer.File,
  ): Promise<Blog> {
    const blog = await this.findOne(id);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    if (dto.slug) blog.slug = dto.slug;
    if (dto.status) blog.status = dto.status;

    if (file) {
      blog.featuredImage = `/uploads/blogs/${file.filename}`;
    }

    if (dto.translations) {
      if (!Array.isArray(dto.translations)) {
        throw new Error('Translations is not an array at update');
      }
      await this.blogTranslationRepo.delete({ blog: { id } });

      blog.translations = dto.translations.map(
        (t: CreateBlogTranslationDto) => {
          const translation = new BlogTranslation();
          translation.language = t.language;
          translation.title = t.title;
          translation.content = t.content;
          translation.excerpt = t.excerpt;
          return translation;
        },
      );
    }

    return this.blogRepo.save(blog);
  }

  async delete(id: number): Promise<void> {
    const blog = await this.findOne(id);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    await this.blogRepo.remove(blog);
  }
}
