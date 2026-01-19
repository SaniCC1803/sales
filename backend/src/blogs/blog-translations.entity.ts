import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Blog } from './blog.entity';
import { Language } from '../shared-types';

@Entity()
export class BlogTranslation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'enum',
    enum: Language,
  })
  language!: Language;

  @Column()
  title!: string;

  @Column('text')
  content!: string;

  @Column({ nullable: true })
  excerpt?: string;

  @ManyToOne(() => Blog, (blog) => blog.translations, { onDelete: 'CASCADE' })
  blog!: Blog;
}
