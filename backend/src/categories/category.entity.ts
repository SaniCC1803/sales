import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Product } from '../products/product.entity';
import { CategoryTranslation } from './category-translations.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Category, (category) => category.subcategories, {
    nullable: true,
  })
  parent?: Category | null;

  @OneToMany(() => Category, (category) => category.parent)
  subcategories?: Category[];

  @Column()
  image!: string;

  @OneToMany(() => Product, (product) => product.category)
  products?: Product[];

  @OneToMany(() => CategoryTranslation, (t) => t.category, {
    cascade: true,
    eager: true,
  })
  translations!: CategoryTranslation[];
}
