export interface Location {
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

export interface GeocodingResult {
  name: string;
  admin1?: string;
  country?: string;
  country_code?: string;
  latitude: number;
  longitude: number;
}

export interface HourlySnapshot {
  time: string;
  airTempF: number;
  windMph: number;
  windDirectionDeg: number;
  weatherCode: number;
  waterTempF: number | null;
  waveHeightFt: number | null;
}

export interface TidePoint {
  time: string;
  heightFt: number;
}

export interface Conditions {
  waterTempF: number | null;
  waveHeightFt: number | null;
  wavePeriodS: number | null;
  waveDirectionDeg: number | null;
  swellHeightFt: number | null;
  swellPeriodS: number | null;
  airTempF: number;
  feelsLikeF: number;
  windMph: number;
  windDirectionDeg: number;
  weatherCode: number;
  humidity: number;
  precipitationMm: number;
  pressureHpa: number;
  timestamp: string;
  timezone: string;
  hourly: HourlySnapshot[];
  tide: TidePoint[];
}

export const LIDO_BEACH: Location = {
  name: 'Lido Beach',
  admin1: 'New York',
  country: 'United States',
  latitude: 40.5897,
  longitude: -73.6354,
};
