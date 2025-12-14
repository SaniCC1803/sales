import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../applications/application.entity';
import { CreateApplicationDto } from './applications.dto';
import { User } from '../users/user.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll() {
    const apps = await this.applicationRepo.find({ relations: ['owner'] });
    return apps;
  }

  findOne(id: number) {
    return this.applicationRepo.findOne({
      where: { id },
      relations: ['owner'],
    });
  }

  async create(data: CreateApplicationDto) {
    const entity = this.applicationRepo.create(data);

    if (data.owner?.email) {
      const user = await this.userRepo.findOne({
        where: { email: data.owner.email },
      });

      if (!user) {
        throw new Error(`User with email ${data.owner.email} not found`);
      }

      entity.owner = user;
    }

    return this.applicationRepo.save(entity);
  }

  async update(id: number, data: Partial<Application>) {
    await this.applicationRepo.update(id, data);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.applicationRepo.delete(id);
  }
}
