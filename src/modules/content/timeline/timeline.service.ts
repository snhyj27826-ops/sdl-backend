import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTimelineEventDto } from './dto/create-timeline-event.dto';
import { TimelineEvent, TimelineEventDocument } from './timeline.schema';

@Injectable()
export class TimelineService {
  constructor(
    @InjectModel(TimelineEvent.name)
    private readonly timelineEventModel: Model<TimelineEventDocument>,
  ) {}

  async findPublished(page: number = 1, limit: number = 3) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.timelineEventModel
        .find({ isPublished: true })
        .sort({ year: 1, sortOrder: 1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.timelineEventModel.countDocuments({ isPublished: true }),
    ]);

    const hasMore = skip + limit < total;

    return { data, total, hasMore };
  }

  findAll() {
    return this.timelineEventModel
      .find()
      .sort({ year: 1, sortOrder: 1 })
      .lean()
      .exec();
  }

  create(createDto: CreateTimelineEventDto) {
    return this.timelineEventModel.create(createDto);
  }

  update(id: string, updateDto: Partial<CreateTimelineEventDto>) {
    return this.timelineEventModel
      .findByIdAndUpdate(id, updateDto, { new: true, runValidators: true })
      .lean()
      .exec();
  }

  remove(id: string) {
    return this.timelineEventModel.findByIdAndDelete(id).lean().exec();
  }
}
