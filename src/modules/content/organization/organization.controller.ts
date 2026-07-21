import { Body, Controller, Post } from '@nestjs/common';
import { FindPublishedOrganizationMembersDto } from './dto/find-published-organization-members.dto';
import { OrganizationService } from './organization.service';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  findPublished(@Body() body: FindPublishedOrganizationMembersDto) {
    return this.organizationService.findPublished(body.locale ?? 'en');
  }
}
