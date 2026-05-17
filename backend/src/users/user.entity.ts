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

  @Column({ nullable: true })
  password?: string;

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

  @Column({ type: 'datetime', nullable: true })
  confirmationTokenExpiresAt?: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  refreshToken?: string | null;
}
