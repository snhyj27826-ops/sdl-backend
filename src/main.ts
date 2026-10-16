import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { rateLimit } from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS ?? 0);
  if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0) {
    throw new Error('TRUST_PROXY_HOPS must be a non-negative integer');
  }
  app.getHttpAdapter().getInstance().set('trust proxy', trustProxyHops);
  app.use(
    '/api/contact',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 5,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        message: 'Too many contact requests. Please try again later.',
      },
    }),
  );
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(process.env.PORT || 3000);
}
bootstrap().catch((err) => console.log(err));
