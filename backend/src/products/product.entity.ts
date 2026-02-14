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

  @Column('simple-array')
  images!: string[];

  @Column('float')
  price!: number;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: true,
  })
  category?: Category | null;

  @OneToMany(() => ProductTranslation, (t) => t.product, {
    cascade: true,
    eager: true,
  })
  translations!: ProductTranslation[];

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'int', default: 0 })
  views!: number;
}
