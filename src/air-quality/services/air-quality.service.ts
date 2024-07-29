import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { thresholds } from '../../data/thresholds';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Cron } from '@nestjs/schedule';
import {
  StationAirQuality,
  StationWithIndex,
} from '../interfaces/station.interface';
import { AirQualityIndex, Station } from '@prisma/client';
import { GiosService } from './gios-api.service';
import { retryQuery } from 'src/helpers/retry-query';
import { getCurrentHour } from 'src/helpers/current-hour';
import { AirQualityRepository } from '../air-quality.repository';

@Injectable()
export class AirQualityService implements OnModuleInit {
  private readonly logger = new Logger(AirQualityService.name);
  constructor(
    private prisma: PrismaService,
    private giosService: GiosService,
    private repository: AirQualityRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async onModuleInit() {
    const { startOfHour, endOfHour } = getCurrentHour();
    const currentStationsIndexes = await this.repository.getCurrentSationsIndex(
      startOfHour,
      endOfHour,
    );

    if (currentStationsIndexes.length === 0) {
      await this.createAirIndexes();
    }
  }

  async calcStationIndex(
    station: Station,
  ): Promise<Omit<AirQualityIndex, 'id' | 'createdAt' | 'updatedAt'>> {
    const sensors = await this.giosService.getSensors(station.id);
    const sensorValues = await Promise.all(
      sensors.flat().map(async (sensor) => {
        const value = await this.giosService.getPollutantValue(sensor.id);
        return { ...sensor, value };
      }),
    );
    const airIndex = this.calcAirIndex(
      sensorValues.map((sensor) => ({
        paramCode: sensor.param.paramCode,
        value: sensor.value.value,
        measurementTime: sensor.value.measurementTime,
      })),
    );

    return {
      stationId: station.id,
      indexId: airIndex.id,
      value: airIndex.value,
      measurementTime: airIndex.measurementTime,
    };
  }

  @Cron('0 * * * *')
  async createAirIndexes() {
    this.logger.debug('Creating air indexes');
    const stations = await this.repository.getStations();
    const size = 20;

    for (let i = 0; i < stations.length; i += size) {
      const batch = stations.slice(i, i + size);
      const airQualityIndexBatch = await Promise.all(
        batch.map((station) => this.calcStationIndex(station)),
      );

      await retryQuery(async () => {
        await this.prisma.airQualityIndex.createMany({
          data: airQualityIndexBatch,
        });
      }, 3);
    }

    this.logger.debug('Air quality indexes created');
  }

  @Cron('5-59/5 * * * *')
  async updateAirIndexes() {
    this.logger.debug('Updating air indexes with invalid value');
    const recordsToUpdate = await this.repository.getIndexesToUpdate();
    const size = 20;

    for (let i = 0; i < recordsToUpdate.length; i += size) {
      const batch = recordsToUpdate.slice(i, i + size);
      const updatePromises = batch.map(async (record) => {
        const station = await this.repository.getStation(record.stationId);
        const airIndex = await this.calcStationIndex(station);

        if (airIndex.value === -1) return;

        return this.prisma.airQualityIndex.update({
          where: { id: record.id },
          data: {
            indexId: airIndex.indexId,
            value: airIndex.value,
            measurementTime: airIndex.measurementTime,
          },
        });
      });

      await Promise.all(updatePromises);
    }

    this.logger.debug(`Updated indexes: ${recordsToUpdate.length} records`);
  }

  getIndexId(paramCode: string, value: number): number {
    const breakpoints = thresholds[paramCode]?.breakpoints;
    // if there is not breakpoints for pollutant return
    if (!breakpoints) return null;

    for (let i = 0; i < breakpoints.length; i++) {
      if (value <= breakpoints[i]) {
        return i + 2;
      }
    }
    return breakpoints.length + 2;
  }

  calcAirIndex(
    sensors: { paramCode: string; value: number; measurementTime: Date }[],
  ): { id: number; value: number; measurementTime: Date } {
    let indexValue = -1;
    let worstIndexId = 1;
    let indexMeasurementTime = sensors[0].measurementTime;

    sensors.forEach(({ value, paramCode, measurementTime }) => {
      if (value === -1) return;

      const indexId = this.getIndexId(paramCode, value);
      if (indexId > worstIndexId) {
        worstIndexId = indexId;
        indexValue = value;
        indexMeasurementTime = measurementTime;
      }
    });

    return {
      id: worstIndexId,
      value: indexValue,
      measurementTime: indexMeasurementTime,
    };
  }

  async getStationsWithIndex(): Promise<StationWithIndex[]> {
    const cachedData =
      await this.cacheManager.get<StationWithIndex[]>('airIndexes');

    if (cachedData) {
      this.logger.debug('Getting stations with air quality index from redis');

      return cachedData;
    }
    this.logger.debug('Getting stations with air quality index');
    const { startOfHour, endOfHour } = getCurrentHour();

    const currentStationsIndexes = await this.repository.getCurrentSationsIndex(
      startOfHour,
      endOfHour,
    );

    const stationsIndex = currentStationsIndexes.map((station) => {
      const airIndex = station.airQualityIndex[0];

      return {
        ...station,
        indexId: airIndex.index.id,
        indexColor: airIndex.index.color,
      };
    });
    await this.cacheManager.set('airIndexes', stationsIndex, 300);

    return stationsIndex;
  }

  async getStationAirQuality(stationId: number): Promise<StationAirQuality> {
    this.logger.debug(`Getting station ${stationId} air quality`);
    const station = await this.repository.getStation(stationId);
    const sensors = await this.giosService.getSensors(stationId);
    const sensorValues = await Promise.all(
      sensors.map(async (sensor) => {
        const value = await this.giosService.getPollutantValue(sensor.id);
        return value;
      }),
    );
    const airIndex = await this.repository.getAirQualityIndex(stationId);

    return {
      ...station,
      sensors: sensorValues,
      indexId: airIndex.indexId,
      indexValue: airIndex.value,
      indexName: airIndex.index.name,
      indexColor: airIndex.index.color,
      measurementTime: airIndex.measurementTime,
    };
  }

  async createStations() {
    this.logger.debug('Adding stations data from GIOS to database');
    const stations = await this.giosService.getStations();

    for (const station of stations) {
      await this.prisma.station.create({
        data: {
          id: station.id,
          name: station.stationName,
          latitude: station.gegrLat,
          longitude: station.gegrLon,
          city: station.city.name,
          communeName: station.city.commune.communeName,
          districtName: station.city.commune.districtName,
          provinceName: station.city.commune.provinceName,
          addressStreet: station.addressStreet,
        },
      });
    }
    this.logger.debug('Stations added to database');

    return {
      message: 'Stations from GIOS added',
    };
  }

  async test() {
    //
  }
}
