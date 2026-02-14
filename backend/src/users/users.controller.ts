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
import { Req, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

// Extend Express Request type to include user
declare module 'express' {
  interface Request {
    user?: any;
  }
}

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
  create(@Body() data: CreateUserDto, @Req() req: Request) {
    if (
      String(data.role) === 'SUPERADMIN' &&
      String(req.user?.role) !== 'SUPERADMIN'
    ) {
      throw new ForbiddenException(
        'Only superadmin can create another superadmin',
      );
    }
    return this.usersService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() data: Partial<User>,
    @Req() req: Request,
  ) {
    if (
      String(data.role) === 'SUPERADMIN' ||
      String(req.body.role) === 'SUPERADMIN'
    ) {
      if (String(req.user?.role) !== 'SUPERADMIN') {
        throw new ForbiddenException('Only superadmin can edit a superadmin');
      }
    }
    return this.usersService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('role', 'SUPERADMIN')
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}
