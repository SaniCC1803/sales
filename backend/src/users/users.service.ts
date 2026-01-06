// ...existing code...
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './users.dto';
import { generateConfirmationToken, sendConfirmationEmail } from './email.util';
import { ApplicationsService } from '../applications/applications.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    public readonly applicationsService: ApplicationsService,
  ) {}

  async findAll() {
    return await this.userRepo.find({
      select: ['id', 'email', 'role', 'isConfirmed'],
    });
  }

  findOne(id: number) {
    return this.userRepo.findOne({
      where: { id },
      select: ['id', 'email', 'role', 'isConfirmed'],
    });
  }

  async create(data: CreateUserDto) {
    const confirmationToken = generateConfirmationToken();
    // Hash password before saving
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const entity = this.userRepo.create({
      ...data,
      password: hashedPassword,
      isConfirmed: false,
      confirmationToken,
    });
    const saved = await this.userRepo.save(entity);
    // Get first application for name/branding
    let appName = 'Your Application';
    let contactEmail: string | undefined = undefined;
    try {
      const apps = await this.applicationsService.findAll();
      if (apps && apps.length > 0) {
        // Use translation or fallback to id
        appName = apps[0].translations?.[0]?.name || `App #${apps[0].id}`;
        contactEmail = apps[0].contactEmail;
      }
    } catch {
      console.log('Error');
    }
    await sendConfirmationEmail(
      saved.email,
      confirmationToken,
      appName,
      contactEmail,
    );
    return saved;
  }

  async findByConfirmationToken(token: string) {
    return this.userRepo.findOne({ where: { confirmationToken: token } });
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  async confirmUser(id: number) {
    await this.userRepo.update(id, {
      isConfirmed: true,
      confirmationToken: undefined,
    });
    return this.findOne(id);
  }

  async update(id: number, data: Partial<User>) {
    await this.userRepo.update(id, data);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.userRepo.delete(id);
  }
}
