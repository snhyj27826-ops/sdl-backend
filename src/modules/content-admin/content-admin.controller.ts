import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '../auth/roles.enum';
import { RolesGuard } from '../auth/roles.guard';
import { CreateOrganizationMemberDto } from '../content/organization/dto/create-organization-member.dto';
import { CreateTimelineEventDto } from '../content/timeline/dto/create-timeline-event.dto';
import { ContentAdminService } from './content-admin.service';

@Controller('admin/content')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
export class ContentAdminController {
  constructor(private readonly contentAdminService: ContentAdminService) {}

  @Get('history')
  getTimeline() {
    return this.contentAdminService.getTimeline();
  }

  @Post('history')
  createTimeline(@Body() payload: CreateTimelineEventDto) {
    return this.contentAdminService.createTimeline(payload);
  }

  @Patch('history/:id')
  updateTimeline(
    @Param('id') id: string,
    @Body() payload: Partial<CreateTimelineEventDto>,
  ) {
    return this.contentAdminService.updateTimeline(id, payload);
  }

  @Delete('history/:id')
  deleteTimeline(@Param('id') id: string) {
    return this.contentAdminService.deleteTimeline(id);
  }

  @Get('organization')
  getOrganization() {
    return this.contentAdminService.getOrganization();
  }

  @Post('organization')
  createOrganizationMember(@Body() payload: CreateOrganizationMemberDto) {
    return this.contentAdminService.createOrganizationMember(payload);
  }

  @Patch('organization/:id')
  updateOrganizationMember(
    @Param('id') id: string,
    @Body() payload: Partial<CreateOrganizationMemberDto>,
  ) {
    return this.contentAdminService.updateOrganizationMember(id, payload);
  }

  @Delete('organization/:id')
  deleteOrganizationMember(@Param('id') id: string) {
    return this.contentAdminService.deleteOrganizationMember(id);
  }
}
