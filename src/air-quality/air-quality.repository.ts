import { Injectable } from '@nestjs/common';
import { AirQualityIndex, Index, Station } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { getCurrentHour } from 'src/helpers/current-hour';

@Injectable()
export class AirQualityRepository {
  constructor(private prisma: PrismaService) {}

  getStations(): Promise<Station[]> {
    return this.prisma.station.findMany();
  }

  getStation(stationId: number): Promise<Station> {
    return this.prisma.station.findFirst({
      where: {
        id: stationId,
      },
    });
  }

  getAirQualityIndex(
    stationId: number,
  ): Promise<AirQualityIndex & { index: Index }> {
    return this.prisma.airQualityIndex.findFirst({
      where: {
        stationId,
      },
      orderBy: {
        measurementTime: 'desc',
      },
      include: {
        index: true,
      },
    });
  }

  getIndexesToUpdate(): Promise<AirQualityIndex[]> {
    const { startOfHour, endOfHour } = getCurrentHour();

    return this.prisma.airQualityIndex.findMany({
      where: {
        measurementTime: {
          not: startOfHour,
        },
        createdAt: {
          gte: startOfHour,
          lte: endOfHour,
        },
      },
    });
  }

  async getCurrentSationsIndex(
    startOfHour: Date,
    endOfHour: Date,
  ): Promise<
    (Station & {
      airQualityIndex: { index: { color: string; id: number } }[];
    })[]
  > {
    return this.prisma.station.findMany({
      where: {
        airQualityIndex: {
          some: {
            createdAt: {
              gte: startOfHour,
              lte: endOfHour,
            },
          },
        },
      },
      include: {
        airQualityIndex: {
          where: {
            createdAt: {
              gte: startOfHour,
              lte: endOfHour,
            },
          },
          select: {
            createdAt: true,
            index: {
              select: {
                color: true,
                id: true,
              },
            },
          },
        },
      },
    });
  }
}
