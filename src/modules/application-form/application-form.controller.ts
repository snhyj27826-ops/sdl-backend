import { Body, Controller, Post } from '@nestjs/common';
import { CreateApplicationDto } from './application-form.dto';
import { ApplicationFormService } from './application-form.service';

@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationFormService) {}

  @Post('create')
  create(@Body() dto: CreateApplicationDto) {
    return this.applicationService.create(dto);
  }
}
