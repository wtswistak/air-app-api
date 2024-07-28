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
    return this.airQualityService.createAirIndexes();
    // return this.airQualityService.test();
    // throw new ForbiddenException('You are not allowed to access this resource');
    // const res = await this.airQualityService.getStations();
    // console.log(res);
    // return res;
  }

  @Get(':stationId')
  getStationAirQuality(
    @Param('stationId', ParseIntPipe) stationId: number,
  ): Promise<StationAirQuality> {
    return this.airQualityService.getStationAirQuality(stationId);
  }
}
