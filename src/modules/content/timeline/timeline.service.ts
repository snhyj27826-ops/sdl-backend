import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Locale } from '../../../common/localization/localization';
import { CreateTimelineEventDto } from './dto/create-timeline-event.dto';
import { FindPublishedTimelineDto } from './dto/find-published-timeline.dto';
import { TimelineEvent, TimelineEventDocument } from './timeline.schema';

@Injectable()
export class TimelineService {
  constructor(
    @InjectModel(TimelineEvent.name)
    private readonly timelineEventModel: Model<TimelineEventDocument>,
  ) {}

  async findPublished({
    page = 1,
    limit = 3,
    locale = 'en',
  }: FindPublishedTimelineDto) {
    const skip = (page - 1) * limit;
    const filter = { isPublished: true };

    const [events, total] = await Promise.all([
      this.timelineEventModel
        .find(filter)
        .sort({ year: 1, sortOrder: 1 })
        .skip(skip)
        .limit(limit)
        .lean<TimelineEvent[]>()
        .exec(),
      this.timelineEventModel.countDocuments(filter).exec(),
    ]);

    return {
      data: events.map((event) => this.localizeEvent(event, locale)),
      total,
      hasMore: skip + events.length < total,
    };
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
      .findByIdAndUpdate(id, updateDto, {
        new: true,
        runValidators: true,
      })
      .lean()
      .exec();
  }

  remove(id: string) {
    return this.timelineEventModel.findByIdAndDelete(id).lean().exec();
  }

  private localizeEvent(event: TimelineEvent, locale: Locale) {
    return {
      ...event,
      title: event.title[locale],
      subtitle: event.subtitle?.[locale],
      description: event.description[locale],
    };
  }
}
