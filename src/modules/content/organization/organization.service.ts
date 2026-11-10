import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrganizationMemberDto } from './dto/create-organization-member.dto';
import {
  OrganizationMember,
  OrganizationMemberDocument,
} from './organization-member.schema';
import { OrganizationCategory } from './organization-category';
import { Locale } from '../../../common/localization/localization';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(OrganizationMember.name)
    private readonly organizationMemberModel: Model<OrganizationMemberDocument>,
  ) {}

  async findPublished(locale: Locale, category?: OrganizationCategory) {
    const members = await this.organizationMemberModel
      .find({ isPublished: true, ...(category && { category }) })
      .sort({ sortOrder: 1, [`fullName.${locale}`]: 1 })
      .lean()
      .exec();

    return members.map((member) => ({
      ...member,
      fullName: member.fullName[locale],
      role: member.role[locale],
      biography: member.biography[locale],
    }));
  }

  async findPublishedMember(
    locale: Locale,
    category?: OrganizationCategory,
    id?: string,
  ) {
    const filter = id
      ? { isPublished: true, _id: id }
      : { isPublished: true, category };
    const member = await this.organizationMemberModel
      .findOne(filter)
      .sort({ sortOrder: 1 })
      .lean()
      .exec();

    if (!member) {
      throw new NotFoundException(`No member found for ${id ? `id "${id}"` : `category "${category}"`}`);
    }

    return {
      ...member,
      fullName: member.fullName[locale],
      role: member.role[locale],
      biography: member.biography[locale],
    };
  }

  findAll() {
    return this.organizationMemberModel
      .find()
      .sort({ sortOrder: 1, 'fullName.en': 1 })
      .lean()
      .exec();
  }

  create(createDto: CreateOrganizationMemberDto) {
    return this.organizationMemberModel.create(createDto);
  }

  update(id: string, updateDto: Partial<CreateOrganizationMemberDto>) {
    return this.organizationMemberModel
      .findByIdAndUpdate(id, updateDto, {
        new: true,
        runValidators: true,
      })
      .lean()
      .exec();
  }

  remove(id: string) {
    return this.organizationMemberModel.findByIdAndDelete(id).lean().exec();
  }
}
