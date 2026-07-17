import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTimelineEventDto } from './dto/create-timeline-event.dto';
import { TimelineEvent, TimelineEventDocument } from './timeline.schema';
import {
  isLocale,
  Locale,
  LOCALES,
  LocalizedTextValue,
} from '../../../common/localization/localization';

type LocalizedInput = string | LocalizedTextValue;
type TimelineEventRecord = {
  title?: unknown;
  subtitle?: unknown;
  description?: unknown;
};

@Injectable()
export class TimelineService {
  constructor(
    @InjectModel(TimelineEvent.name)
    private readonly timelineEventModel: Model<TimelineEventDocument>,
  ) {}

  async findPublished(
    page: number = 1,
    limit: number = 3,
    locale: string = 'en',
  ) {
    const resolvedLocale = this.resolveLocale(locale);
    const resolvedPage = Number.isInteger(page) && page > 0 ? page : 1;
    const resolvedLimit = Number.isInteger(limit) && limit > 0 ? limit : 3;
    const skip = (resolvedPage - 1) * resolvedLimit;

    const [data, total] = await Promise.all([
      this.timelineEventModel
        .find({ isPublished: true })
        .sort({ year: 1, sortOrder: 1 })
        .skip(skip)
        .limit(resolvedLimit)
        .lean()
        .exec(),
      this.timelineEventModel.countDocuments({ isPublished: true }),
    ]);

    const hasMore = skip + resolvedLimit < total;

    const localizedData = data.map((event) =>
      this.mapPublishedEvent(
        event as unknown as TimelineEventRecord,
        resolvedLocale,
      ),
    );

    return { data: localizedData, total, hasMore };
  }

  async findAll() {
    const data = await this.timelineEventModel
      .find()
      .sort({ year: 1, sortOrder: 1 })
      .lean()
      .exec();

    return data.map((event) =>
      this.mapAdminEvent(event as unknown as TimelineEventRecord),
    );
  }

  async create(createDto: CreateTimelineEventDto) {
    const created = await this.timelineEventModel.create(
      this.normalizePayload(createDto, false),
    );
    return this.mapAdminEvent(created.toObject() as TimelineEventRecord);
  }

  async update(id: string, updateDto: Partial<CreateTimelineEventDto>) {
    const payload = this.normalizePayload(updateDto, true);

    const updated = await this.timelineEventModel
      .findByIdAndUpdate(id, payload, { new: true, runValidators: true })
      .lean()
      .exec();

    return updated
      ? this.mapAdminEvent(updated as unknown as TimelineEventRecord)
      : null;
  }

  remove(id: string) {
    return this.timelineEventModel.findByIdAndDelete(id).lean().exec();
  }

  private resolveLocale(locale: string): Locale {
    if (!isLocale(locale)) {
      throw new BadRequestException(
        `Unsupported locale "${locale}". Supported locales: ${LOCALES.join(', ')}`,
      );
    }

    return locale;
  }

  private mapPublishedEvent(event: TimelineEventRecord, locale: Locale) {
    const localizedEvent = this.mapAdminEvent(event);

    return {
      ...localizedEvent,
      title: localizedEvent.title[locale],
      subtitle: localizedEvent.subtitle?.[locale],
      description: localizedEvent.description[locale],
    };
  }

  private mapAdminEvent(event: TimelineEventRecord) {
    return {
      ...(event as object),
      title: this.toLocalizedText(event.title, 'title', true),
      subtitle:
        event.subtitle === undefined
          ? undefined
          : this.toLocalizedText(event.subtitle, 'subtitle', false),
      description: this.toLocalizedText(event.description, 'description', true),
    };
  }

  private normalizePayload(
    payload: Partial<CreateTimelineEventDto>,
    isPartial: boolean,
  ) {
    const normalized = { ...payload } as Partial<CreateTimelineEventDto> & {
      title?: LocalizedTextValue;
      subtitle?: LocalizedTextValue;
      description?: LocalizedTextValue;
    };

    if (payload.title !== undefined || !isPartial) {
      normalized.title = this.toLocalizedInput(
        payload.title as LocalizedInput,
        'title',
        !isPartial,
      );
    } else {
      delete normalized.title;
    }

    if (payload.subtitle !== undefined) {
      normalized.subtitle = this.toLocalizedInput(
        payload.subtitle as LocalizedInput,
        'subtitle',
        false,
      );
    } else {
      delete normalized.subtitle;
    }

    if (payload.description !== undefined || !isPartial) {
      normalized.description = this.toLocalizedInput(
        payload.description as LocalizedInput,
        'description',
        !isPartial,
      );
    } else {
      delete normalized.description;
    }

    return normalized;
  }

  private toLocalizedInput(
    value: LocalizedInput | undefined,
    field: 'title' | 'subtitle' | 'description',
    isRequired: boolean,
  ) {
    if (value === undefined) {
      if (isRequired) {
        throw new BadRequestException(
          `"${field}" is required and must include en, sr and mk.`,
        );
      }

      return undefined;
    }

    const localized =
      typeof value === 'string' ? this.duplicateAcrossLocales(value) : value;

    if (!this.isLocalizedTextValue(localized)) {
      throw new BadRequestException(
        `"${field}" must include non-empty en, sr and mk strings.`,
      );
    }

    this.validateLocalizedLength(field, localized);

    return localized;
  }

  private toLocalizedText(
    value: unknown,
    field: 'title' | 'subtitle' | 'description',
    isRequired: boolean,
  ): LocalizedTextValue | undefined {
    if (value === undefined) {
      if (isRequired) {
        throw new BadRequestException(
          `"${field}" is missing from timeline event data.`,
        );
      }

      return undefined;
    }

    const localized =
      typeof value === 'string' ? this.duplicateAcrossLocales(value) : value;

    if (!this.isLocalizedTextValue(localized)) {
      throw new BadRequestException(
        `"${field}" must include en, sr and mk strings.`,
      );
    }

    return localized;
  }

  private duplicateAcrossLocales(value: string): LocalizedTextValue {
    return {
      en: value,
      sr: value,
      mk: value,
    };
  }

  private validateLocalizedLength(
    field: 'title' | 'subtitle' | 'description',
    value: LocalizedTextValue,
  ) {
    const maxLength =
      field === 'title' ? 120 : field === 'subtitle' ? 200 : undefined;

    if (!maxLength) {
      return;
    }

    for (const locale of LOCALES) {
      if (value[locale].length > maxLength) {
        throw new BadRequestException(
          `"${field}.${locale}" exceeds max length of ${maxLength} characters.`,
        );
      }
    }
  }

  private isLocalizedTextValue(value: unknown): value is LocalizedTextValue {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    return LOCALES.every((locale) => {
      const localeValue = (value as Record<string, unknown>)[locale];
      return typeof localeValue === 'string' && localeValue.trim().length > 0;
    });
  }
}
