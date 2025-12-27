import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from './product.entity';
import { Language } from '../shared-types';

@Entity()
export class ProductTranslation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    default: Language.EN,
  })
  language!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => Product, (product) => product.translations, {
    onDelete: 'CASCADE',
  })
  product!: Product;
}
