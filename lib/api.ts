import type { Conditions } from './types';

const MARINE_BASE = 'https://marine-api.open-meteo.com/v1/marine';
const FORECAST_BASE = 'https://api.open-meteo.com/v1/forecast';

export async function fetchConditions(lat: number, lon: number): Promise<Conditions> {
  const marineParams = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: [
      'sea_surface_temperature',
      'wave_height',
      'wave_period',
      'wave_direction',
      'swell_wave_height',
      'swell_wave_period',
    ].join(','),
    temperature_unit: 'fahrenheit',
    length_unit: 'imperial',
    timezone: 'auto',
  });

  const forecastParams = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'wind_speed_10m',
      'wind_direction_10m',
      'weather_code',
      'relative_humidity_2m',
      'precipitation',
      'pressure_msl',
    ].join(','),
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    timezone: 'auto',
  });

  const isServer = typeof window === 'undefined';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const init: any = isServer
    ? { next: { revalidate: 600 } }
    : { cache: 'no-store' };

  const [marineRes, forecastRes] = await Promise.all([
    fetch(`${MARINE_BASE}?${marineParams.toString()}`, init).catch(() => null),
    fetch(`${FORECAST_BASE}?${forecastParams.toString()}`, init),
  ]);

  if (!forecastRes.ok) {
    throw new Error('Atmospheric telemetry failed');
  }

  const marine = marineRes && marineRes.ok ? await marineRes.json() : { current: {} };
  const forecast = await forecastRes.json();

  return {
    waterTempF: nullableNumber(marine.current?.sea_surface_temperature),
    waveHeightFt: nullableNumber(marine.current?.wave_height),
    wavePeriodS: nullableNumber(marine.current?.wave_period),
    waveDirectionDeg: nullableNumber(marine.current?.wave_direction),
    swellHeightFt: nullableNumber(marine.current?.swell_wave_height),
    swellPeriodS: nullableNumber(marine.current?.swell_wave_period),
    airTempF: forecast.current.temperature_2m,
    feelsLikeF: forecast.current.apparent_temperature,
    windMph: forecast.current.wind_speed_10m,
    windDirectionDeg: forecast.current.wind_direction_10m,
    weatherCode: forecast.current.weather_code,
    humidity: forecast.current.relative_humidity_2m,
    precipitationMm: forecast.current.precipitation,
    pressureHpa: forecast.current.pressure_msl,
    timestamp: forecast.current.time,
    timezone: forecast.timezone,
  };
}

function nullableNumber(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}
