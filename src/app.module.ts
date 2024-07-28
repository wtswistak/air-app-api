import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AirQualityModule } from './air-quality/air-quality.module';
import { HttpModule } from '@nestjs/axios';
import { AppConfigModule } from './common/config/app-config.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { PrismaModule } from './common/prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ApiKeyMiddleware } from './middlewares/key-auth';

@Module({
  imports: [
    AppConfigModule,
    HttpModule,
    PrismaModule,
    CacheModule.register({
      store: redisStore,
      url: process.env.REDIS_URL,
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    AirQualityModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiKeyMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
