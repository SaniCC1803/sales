import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { User } from '../users/user.entity';
import { BlogTranslation } from './blog-translations.entity';

export enum BlogStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  slug!: string;

  @Column({ nullable: true })
  featuredImage?: string;

  @Column({
    type: 'enum',
    enum: BlogStatus,
    default: BlogStatus.DRAFT,
  })
  status!: BlogStatus;

  @Column({ nullable: true })
  publishedAt?: Date;

  @ManyToOne(() => User, { eager: true, onDelete: 'SET NULL', nullable: true })
  author?: User;

  @OneToMany(() => BlogTranslation, (translation) => translation.blog, {
    cascade: true,
    eager: true,
  })
  translations!: BlogTranslation[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  updatePublishedAt() {
    if (this.status === BlogStatus.PUBLISHED && !this.publishedAt) {
      this.publishedAt = new Date();
    }
  }
}
