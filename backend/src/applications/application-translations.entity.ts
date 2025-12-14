import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Application } from './application.entity';
import { Language } from '../shared-types';

@Entity()
export class ApplicationTranslation {
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

  @ManyToOne(() => Application, (application) => application.translations, {
    onDelete: 'CASCADE',
  })
  application!: Application;
}
