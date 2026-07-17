import { Controller, Get, Query } from '@nestjs/common';
import { TimelineService } from './timeline.service';

@Controller('history')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '3',
    @Query('locale') locale: string = 'en',
  ) {
    return this.timelineService.findPublished(
      Number.parseInt(page, 10),
      Number.parseInt(limit, 10),
      locale,
    );
  }
}
