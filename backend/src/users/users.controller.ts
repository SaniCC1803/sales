import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UsersService } from '../users/users.service';
import { Role, User } from './user.entity';
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

  @Get('exists')
  async exists() {
    const count = await this.usersService.count();
    return { exists: count > 0 };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Get()
  async getAll() {
    return await this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: number, @Req() req: Request) {
    const targetId = Number(id);
    const callerId = Number(req.user?.id);
    const isSuperadmin = String(req.user?.role) === Role.SUPERADMIN;
    if (callerId !== targetId && !isSuperadmin) {
      throw new ForbiddenException('You can only view your own account');
    }
    return this.usersService.findOne(id);
  }

  @Post('bootstrap')
  async bootstrap(@Body() data: CreateUserDto) {
    const count = await this.usersService.count();
    if (count > 0) {
      throw new ForbiddenException('Bootstrap is only allowed on an empty database');
    }
    return this.usersService.create({ ...data, role: Role.SUPERADMIN });
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() data: CreateUserDto, @Req() req: Request) {
    if (
      String(data.role) === Role.SUPERADMIN &&
      String(req.user?.role) !== Role.SUPERADMIN
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
    const targetId = Number(id);
    const callerId = Number(req.user?.id);
    const callerRole = String(req.user?.role);
    const isSelf = callerId === targetId;
    const isSuperadmin = callerRole === Role.SUPERADMIN;

    if (!isSelf && !isSuperadmin) {
      throw new ForbiddenException('You can only update your own account');
    }
    if (
      (String(data.role) === Role.SUPERADMIN ||
        String(req.body.role) === Role.SUPERADMIN) &&
      !isSuperadmin
    ) {
      throw new ForbiddenException('Only superadmin can edit a superadmin');
    }
    return this.usersService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}
