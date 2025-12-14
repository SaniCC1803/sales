import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll() {
    return await this.userRepo.find({
      select: ['id', 'email', 'role'],
      relations: ['applications'],
    });
  }

  findOne(id: number) {
    return this.userRepo.findOne({
      where: { id },
      select: ['id', 'email', 'role'],
      relations: ['applications'],
    });
  }

  create(data: CreateUserDto) {
    const entity = this.userRepo.create(data);
    return this.userRepo.save(entity);
  }

  async update(id: number, data: Partial<User>) {
    await this.userRepo.update(id, data);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.userRepo.delete(id);
  }
}
