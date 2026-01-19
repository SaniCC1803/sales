import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
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

  @Get(':id')
  getOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() data: CreateUserDto) {
    return this.usersService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: number, @Body() data: Partial<User>) {
    return this.usersService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('role', 'SUPERADMIN')
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}
