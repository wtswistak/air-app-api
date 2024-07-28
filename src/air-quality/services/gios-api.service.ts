import { StationGios } from '../interfaces/station.interface';
import { firstValueFrom } from 'rxjs';
import { Sensor } from '../interfaces/sensor.interface';
import { Pollutant } from '../interfaces/pollutant.interface';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GiosService {
  constructor(private httpService: HttpService) {}

  async getStations(): Promise<StationGios[]> {
    const { data } = await firstValueFrom(
      this.httpService.get('/station/findAll'),
    );

    return data;
  }

  async getSensors(stationId: number): Promise<Sensor[]> {
    const { data } = await firstValueFrom(
      this.httpService.get(`/station/sensors/${stationId}`),
    );

    return data;
  }

  // get last values from 3 hours, if there is no value, return -1
  async getPollutantValue(sensorId: number): Promise<Pollutant> {
    const { data } = await firstValueFrom(
      this.httpService.get(`/data/getData/${sensorId}`),
    );
    let selectValue = { value: -1, date: Date.now() };
    if (data.values.length) {
      for (let i = 0; i < 3; i++) {
        if (data.values[i]?.value !== null) {
          selectValue = data.values[i];
          break;
        }
      }
    }

    const value = selectValue.value;
    const measurementTime = new Date(selectValue.date);
    return {
      sensorId,
      pollutant: data.key === 'PM2.5' ? 'PM25' : data.key,
      value: parseFloat(value.toFixed(1)),
      measurementTime,
    };
  }
}
