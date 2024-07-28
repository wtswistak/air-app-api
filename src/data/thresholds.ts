export interface PollutantThresholds {
  [key: string]: {
    breakpoints: number[];
  };
}

export const thresholds: PollutantThresholds = {
  PM10: {
    breakpoints: [20, 50, 80, 110, 150],
  },
  PM25: {
    breakpoints: [13, 35, 55, 75, 110],
  },
  O3: {
    breakpoints: [70, 120, 150, 180, 240],
  },
  NO2: {
    breakpoints: [40, 100, 150, 230, 400],
  },
  SO2: {
    breakpoints: [50, 100, 200, 350, 500],
  },
};
