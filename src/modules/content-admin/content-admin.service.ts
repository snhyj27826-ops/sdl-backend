import { Injectable } from '@nestjs/common';
import { CreateTimelineEventDto } from '../content/timeline/dto/create-timeline-event.dto';
import { TimelineService } from '../content/timeline/timeline.service';
import { CreateOrganizationMemberDto } from '../content/organization/dto/create-organization-member.dto';
import { OrganizationService } from '../content/organization/organization.service';
import { CreateDocumentDto } from '../content/documents/dto/create-document.dto';
import { DocumentsService } from '../content/documents/documents.service';

@Injectable()
export class ContentAdminService {
  constructor(
    private readonly timelineService: TimelineService,
    private readonly organizationService: OrganizationService,
    private readonly documentsService: DocumentsService,
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

  getDocuments() {
    return this.documentsService.findAll();
  }

  createDocument(payload: CreateDocumentDto) {
    return this.documentsService.create(payload);
  }

  updateDocument(id: string, payload: Partial<CreateDocumentDto>) {
    return this.documentsService.update(id, payload);
  }

  deleteDocument(id: string) {
    return this.documentsService.remove(id);
  }
}
