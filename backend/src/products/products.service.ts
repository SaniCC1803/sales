import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async findAll() {
    const products = await this.productRepo.find({ relations: ['category'] });
    return products;
  }
  findOne(id: number) {
    return this.productRepo.findOne({ where: { id }, relations: ['category'] });
  }
  async create(data: Partial<Product>) {
    return await this.productRepo.save(this.productRepo.create(data));
  }
  async update(id: number, data: Partial<Product>) {
    await this.productRepo.update(id, data);
    return this.findOne(id);
  }
  remove(id: number) {
    return this.productRepo.delete(id);
  }
}
