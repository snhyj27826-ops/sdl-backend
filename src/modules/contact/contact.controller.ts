import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { CreateContactMessageDto } from './contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly emailService: EmailService) {}

  @Post()
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async sendMessage(@Body() dto: CreateContactMessageDto) {
    await this.emailService.sendContactEmail(dto);
    return { message: 'Contact message sent successfully' };
  }
}
