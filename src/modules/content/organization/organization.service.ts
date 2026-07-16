import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrganizationMemberDto } from './dto/create-organization-member.dto';
import {
  OrganizationMember,
  OrganizationMemberDocument,
} from './organization-member.schema';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(OrganizationMember.name)
    private readonly organizationMemberModel: Model<OrganizationMemberDocument>,
  ) {}

  findPublished() {
    return this.organizationMemberModel
      .find({ isPublished: true })
      .sort({ sortOrder: 1, fullName: 1 })
      .lean()
      .exec();
  }

  findAll() {
    return this.organizationMemberModel
      .find()
      .sort({ sortOrder: 1, fullName: 1 })
      .lean()
      .exec();
  }

  create(createDto: CreateOrganizationMemberDto) {
    return this.organizationMemberModel.create(createDto);
  }

  update(id: string, updateDto: Partial<CreateOrganizationMemberDto>) {
    return this.organizationMemberModel
      .findByIdAndUpdate(id, updateDto, { new: true, runValidators: true })
      .lean()
      .exec();
  }

  remove(id: string) {
    return this.organizationMemberModel.findByIdAndDelete(id).lean().exec();
  }
}
