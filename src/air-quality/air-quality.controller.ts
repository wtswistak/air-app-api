import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { AirQualityService } from './services/air-quality.service';
import {
  StationAirQuality,
  StationWithIndex,
} from './interfaces/station.interface';

@Controller('air-quality')
export class AirQualityController {
  constructor(private readonly airQualityService: AirQualityService) {}

  @Get('stations-index')
  getStationsWithIndex(): Promise<StationWithIndex[]> {
    return this.airQualityService.getStationsWithIndex();
  }

  @Post('stations')
  createStations() {
    return this.airQualityService.createStations();
  }

  @Get('test')
  async test() {
    console.log('');
  }

  @Get(':stationId')
  getStationAirQuality(
    @Param('stationId', ParseIntPipe) stationId: number,
  ): Promise<StationAirQuality> {
    return this.airQualityService.getStationAirQuality(stationId);
  }
}
