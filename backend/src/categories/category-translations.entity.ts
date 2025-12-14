import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Category } from './category.entity';
import { Language } from '../shared-types';

@Entity()
export class CategoryTranslation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    default: Language.EN,
  })
  language!: string;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @ManyToOne(() => Category, (category) => category.translations, {
    onDelete: 'CASCADE',
  })
  category!: Category;
}
