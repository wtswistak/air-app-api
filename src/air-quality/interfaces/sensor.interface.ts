interface Param {
  paramName: string;
  paramFormula: string;
  paramCode: string;
  idParam: number;
}

export interface Sensor {
  id: number;
  stationId: number;
  param: Param;
}
