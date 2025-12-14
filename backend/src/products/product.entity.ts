import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Category } from '../categories/category.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column('float')
  price!: number;

  @ManyToOne(() => Category, (category) => category.products)
  category!: Category;

  @CreateDateColumn()
  createdAt!: Date;
}
