import { Pollutant } from './pollutant.interface';

export interface City {
  id: number;
  name: string;
  commune: {
    communeName: string;
    districtName: string;
    provinceName: string;
  };
}

export interface StationGios {
  id: number;
  stationName: string;
  airIndex: string;
  airIndexValue: number;
  gegrLat: string;
  gegrLon: string;
  city: City;
  addressStreet: string;
}

export interface Station {
  id: number;
  name: string;
  latitude: string;
  longitude: string;
  city: string;
  communeName: string;
  districtName: string;
  provinceName: string;
  addressStreet: string;
}

export interface StationWithIndex extends Station {
  indexId: number;
  indexColor: string;
}

export interface StationAirQuality extends StationWithIndex {
  sensors: Pollutant[];
  indexId: number;
  indexValue: number;
  indexName: string;
  indexColor: string;
  measurementTime: Date;
}
