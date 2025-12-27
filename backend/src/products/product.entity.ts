import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Category } from '../categories/category.entity';
import { ProductTranslation } from './product-translations.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  image!: string;

  @Column('float')
  price!: number;

  @ManyToOne(() => Category, (category) => category.products)
  category!: Category;

  @OneToMany(() => ProductTranslation, (t) => t.product, {
    cascade: true,
    eager: true,
  })
  translations!: ProductTranslation[];

  @CreateDateColumn()
  createdAt!: Date;
}
