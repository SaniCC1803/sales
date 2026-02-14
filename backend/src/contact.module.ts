import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactMessage } from './contact.entity';
import { ContactController } from './contact.controller';
import { Application } from './applications/application.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContactMessage, Application]),
  ],
  controllers: [ContactController],
})
export class ContactModule {}
