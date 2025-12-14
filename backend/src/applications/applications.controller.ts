import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { Application } from './application.entity';
import { CreateApplicationDto } from './applications.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  async getAll() {
    return await this.applicationsService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: number) {
    return this.applicationsService.findOne(id);
  }

  @Post()
  async create(@Body() data: CreateApplicationDto) {
    return await this.applicationsService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() data: Partial<Application>) {
    return this.applicationsService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.applicationsService.remove(id);
  }
}
