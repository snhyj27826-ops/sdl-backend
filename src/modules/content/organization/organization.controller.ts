import { Body, Controller, Post } from '@nestjs/common';
import { FindOrganizationMemberDto } from './dto/find-organization-member.dto';
import { FindPublishedOrganizationMembersDto } from './dto/find-published-organization-members.dto';
import { OrganizationService } from './organization.service';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  findPublished(@Body() body: FindPublishedOrganizationMembersDto) {
    return this.organizationService.findPublished(
      body.locale ?? 'en',
      body.category,
    );
  }

  @Post('member')
  findMember(@Body() body: FindOrganizationMemberDto) {
    return this.organizationService.findPublishedMember(
      body.locale ?? 'en',
      body.category,
      body.id,
    );
  }
}
