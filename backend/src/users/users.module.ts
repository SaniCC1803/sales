import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ApplicationsModule } from '../applications/applications.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ApplicationsModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
