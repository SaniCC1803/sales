import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
  @Column({ default: false })
  isConfirmed!: boolean;

  @Column({ nullable: true })
  confirmationToken?: string;

  @Column({ nullable: true })
  refreshToken?: string;
}
