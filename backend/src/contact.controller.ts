import { Body, Controller, Post, Get, Delete, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from './contact.entity';
import { Application } from './applications/application.entity';
import nodemailer from 'nodemailer';

@Controller('contact')
export class ContactController {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly contactRepo: Repository<ContactMessage>,
    @InjectRepository(Application)
    private readonly appRepo: Repository<Application>,
  ) {}

  @Get()
  async findAll() {
    return await this.contactRepo.find({
      order: { createdAt: 'DESC' }
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    const result = await this.contactRepo.delete(id);
    if (result.affected === 0) {
      return { error: 'Contact message not found' };
    }
    return { success: true };
  }

  @Post()
  async create(@Body() body: any) {
    const { name, email, phone, message } = body;
    if (!email && !phone) {
      return { error: 'Please provide either an email or a phone number.' };
    }
    const contact = this.contactRepo.create({ name, email, phone, message });
    await this.contactRepo.save(contact);

    // Get app contact email
    const app = await this.appRepo.findOne({ where: {} });
    if (app && app.contactEmail) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        secure: false,
      });

      await transporter.sendMail({
        from: '"No Reply" <no-reply@yourdomain.com>',
        to: app.contactEmail,
        subject: 'New Contact Message',
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
      });
    }
    return { success: true };
  }
}
