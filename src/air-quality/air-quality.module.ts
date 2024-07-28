import { Module } from '@nestjs/common';
import { AirQualityController } from './air-quality.controller';
import { AirQualityService } from './services/air-quality.service';
import { HttpModule } from '@nestjs/axios';
import { AppConfigService } from 'src/common/config/app-config.service';
import { AppConfigModule } from 'src/common/config/app-config.module';
import { GiosService } from './services/gios-api.service';
import { AirQualityRepository } from './air-quality.repository';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [AppConfigModule],
      useFactory: async (configService: AppConfigService) => ({
        baseURL: configService.GIOSApiUrl,
        timeout: 15000,
        maxRedirects: 5,
      }),
      inject: [AppConfigService],
    }),
  ],
  controllers: [AirQualityController],
  providers: [AirQualityService, GiosService, AirQualityRepository],
  exports: [AirQualityService],
})
export class AirQualityModule {}
