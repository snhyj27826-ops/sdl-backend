import { Injectable } from '@nestjs/common';
import { CreateTimelineEventDto } from '../content/timeline/dto/create-timeline-event.dto';
import { TimelineService } from '../content/timeline/timeline.service';
import { CreateOrganizationMemberDto } from '../content/organization/dto/create-organization-member.dto';
import { OrganizationService } from '../content/organization/organization.service';

@Injectable()
export class ContentAdminService {
  constructor(
    private readonly timelineService: TimelineService,
    private readonly organizationService: OrganizationService,
  ) {}

  getTimeline() {
    return this.timelineService.findAll();
  }

  createTimeline(payload: CreateTimelineEventDto) {
    return this.timelineService.create(payload);
  }

  updateTimeline(id: string, payload: Partial<CreateTimelineEventDto>) {
    return this.timelineService.update(id, payload);
  }

  deleteTimeline(id: string) {
    return this.timelineService.remove(id);
  }

  getOrganization() {
    return this.organizationService.findAll();
  }

  createOrganizationMember(payload: CreateOrganizationMemberDto) {
    return this.organizationService.create(payload);
  }

  updateOrganizationMember(
    id: string,
    payload: Partial<CreateOrganizationMemberDto>,
  ) {
    return this.organizationService.update(id, payload);
  }

  deleteOrganizationMember(id: string) {
    return this.organizationService.remove(id);
  }
}
