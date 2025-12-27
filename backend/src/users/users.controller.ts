import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from './user.entity';
import { CreateUserDto } from './users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAll() {
    return await this.usersService.findAll();
  }

  @Get('current')
  async getCurrent() {
    try {
      // For now, return the first user or a mock user
      // In a real app, you'd get the current user from auth
      const users = await this.usersService.findAll();
      if (users.length > 0) {
        return users[0];
      }
      // Return a mock user if no users exist
      return {
        id: 1,
        email: 'admin@example.com',
        role: 'SUPERADMIN'
      };
    } catch (error) {
      // If there's any error, return a mock user
      console.log('Error fetching users, returning mock user:', error);
      return {
        id: 1,
        email: 'admin@example.com',
        role: 'SUPERADMIN'
      };
    }
  }

  @Get(':id')
  getOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateUserDto) {
    return this.usersService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() data: Partial<User>) {
    return this.usersService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}
