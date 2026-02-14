import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../applications/application.entity';
import {
  CreateApplicationDto,
  CreateApplicationTranslationDto,
} from './applications.dto';
import { ApplicationTranslation } from './application-translations.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
  ) {}

  async findAll() {
    const apps = await this.applicationRepo.find();
    return apps;
  }

  findOne(id: number) {
    return this.applicationRepo.findOne({
      where: { id },
    });
  }

  async create(data: CreateApplicationDto) {
    const entity = this.applicationRepo.create({
      ...data,
      translations: data.translations.map(
        (t: CreateApplicationTranslationDto) => {
          const translation = new ApplicationTranslation();
          translation.language = t.language;
          translation.name = t.name;
          translation.description = t.description ?? '';
          return translation;
        },
      ),
    });
    return this.applicationRepo.save(entity);
  }

  async update(id: number, data: CreateApplicationDto) {
    // Find the existing application
    const existingApp = await this.applicationRepo.findOne({
      where: { id },
      relations: ['translations'],
    });

    if (!existingApp) {
      throw new Error('Application not found');
    }

    // Update basic properties (logo, languages)
    if (data.logo) {
      existingApp.logo = data.logo;
    }
    if (data.languages) {
      existingApp.languages = data.languages;
    }
    if (data.carousel) {
      existingApp.carousel = data.carousel;
    }

    // Handle translations separately
    if (data.translations) {
      existingApp.translations = data.translations.map(
        (t: CreateApplicationTranslationDto) => {
          const translation = new ApplicationTranslation();
          translation.language = t.language;
          translation.name = t.name;
          translation.description = t.description ?? '';
          return translation;
        },
      );
    }

    // Update contactEmail if provided
    if (data.contactEmail) {
      existingApp.contactEmail = data.contactEmail;
    }
    // Save the updated application (this will cascade to translations)
    return await this.applicationRepo.save(existingApp);
  }

  remove(id: number) {
    return this.applicationRepo.delete(id);
  }
}
