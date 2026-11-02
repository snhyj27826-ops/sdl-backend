import { Body, Controller, Post } from '@nestjs/common';
import { FindOrganizationMemberByRoleDto } from './dto/find-organization-member-by-role.dto';
import { FindPublishedOrganizationMembersDto } from './dto/find-published-organization-members.dto';
import { OrganizationService } from './organization.service';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  findPublished(@Body() body: FindPublishedOrganizationMembersDto) {
    return this.organizationService.findPublished(body.locale ?? 'en');
  }

  @Post('member')
  findByRole(@Body() body: FindOrganizationMemberByRoleDto) {
    return this.organizationService.findPublishedByRole(
      body.locale ?? 'en',
      body.role,
    );
  }
}
