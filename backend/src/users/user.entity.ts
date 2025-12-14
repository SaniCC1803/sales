import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Application } from '../applications/application.entity';

export enum Role {
  USER = 'USER',
  SUPERADMIN = 'SUPERADMIN',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role!: Role;

  @OneToMany(() => Application, (app) => app.owner, {
    nullable: true,
  })
  applications!: Application[];
}
