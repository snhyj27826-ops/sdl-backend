import { Body, Controller, Post } from '@nestjs/common';
import { FindPublishedTimelineDto } from './dto/find-published-timeline.dto';
import { TimelineService } from './timeline.service';

@Controller('history')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Post()
  findPublished(@Body() body: FindPublishedTimelineDto) {
    return this.timelineService.findPublished(body);
  }
}
