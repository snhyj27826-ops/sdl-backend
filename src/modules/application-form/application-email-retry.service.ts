import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ApplicationFormService } from './application-form.service';

const RETRY_INTERVAL_MS = 5 * 60 * 1000;

// Periodically re-sends application emails that failed or were interrupted.
@Injectable()
export class ApplicationEmailRetryService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ApplicationEmailRetryService.name);
  private timer?: NodeJS.Timeout;
  private running = false;

  constructor(private readonly applicationService: ApplicationFormService) {}

  onModuleInit(): void {
    this.timer = setInterval(() => void this.run(), RETRY_INTERVAL_MS);
    this.timer.unref();
  }

  onModuleDestroy(): void {
    clearInterval(this.timer);
  }

  private async run(): Promise<void> {
    if (this.running) {
      return;
    }

    this.running = true;
    try {
      await this.applicationService.retryPendingEmails();
    } catch (error) {
      this.logger.error('Email retry run failed', error as Error);
    } finally {
      this.running = false;
    }
  }
}
