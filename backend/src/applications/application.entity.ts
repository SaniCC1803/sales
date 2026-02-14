import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApplicationTranslation } from './application-translations.entity';
import { Language } from '../shared-types';

@Entity()
export class Application {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    default:
      'https://www.shutterstock.com/image-vector/image-icon-trendy-flat-style-600nw-643080895.jpg',
  })
  logo!: string;

  @Column({
    type: 'varchar',
    array: true,
    default: [Language.EN],
  })
  languages!: string[];

  @OneToMany(() => ApplicationTranslation, (t) => t.application, {
    cascade: true,
    eager: true,
  })
  translations!: ApplicationTranslation[];

  @Column({ nullable: false })
  contactEmail!: string;

  @Column({ nullable: true })
  websiteUrl?: string;

  @Column({
    type: 'varchar',
    array: true,
    default: [],
  })
  carousel!: string[];
}
