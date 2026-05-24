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
}

export const LIDO_BEACH: Location = {
  name: 'Lido Beach',
  admin1: 'New York',
  country: 'United States',
  latitude: 40.5897,
  longitude: -73.6354,
};
