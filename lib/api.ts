import type { Conditions, HourlySnapshot, TidePoint } from './types';

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
    hourly: [
      'sea_surface_temperature',
      'wave_height',
      'sea_level_height_msl',
    ].join(','),
    temperature_unit: 'fahrenheit',
    length_unit: 'imperial',
    timezone: 'auto',
    forecast_days: '2',
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
    hourly: [
      'temperature_2m',
      'wind_speed_10m',
      'wind_direction_10m',
      'weather_code',
    ].join(','),
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    timezone: 'auto',
    forecast_days: '2',
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
    throw new Error(`Atmospheric telemetry failed: HTTP ${forecastRes.status}`);
  }

  const marine = marineRes && marineRes.ok ? await marineRes.json() : { current: {}, hourly: {} };
  const forecast = await forecastRes.json();

  return {
    waterTempF: nullableNumber(marine.current?.sea_surface_temperature),
    waveHeightFt: nullableNumber(marine.current?.wave_height),
    wavePeriodS: nullableNumber(marine.current?.wave_period),
    waveDirectionDeg: nullableNumber(marine.current?.wave_direction),
    swellHeightFt: nullableNumber(marine.current?.swell_wave_height),
    swellPeriodS: nullableNumber(marine.current?.swell_wave_period),
    airTempF: forecast.current?.temperature_2m,
    feelsLikeF: forecast.current?.apparent_temperature,
    windMph: forecast.current?.wind_speed_10m,
    windDirectionDeg: forecast.current?.wind_direction_10m,
    weatherCode: forecast.current?.weather_code,
    humidity: forecast.current?.relative_humidity_2m,
    precipitationMm: forecast.current?.precipitation,
    pressureHpa: forecast.current?.pressure_msl,
    timestamp: forecast.current?.time,
    timezone: forecast.timezone,
    hourly: buildHourly(forecast, marine),
    tide: buildTide(marine),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildHourly(forecast: any, marine: any): HourlySnapshot[] {
  const fcTimes: string[] = forecast.hourly?.time ?? [];
  const fcAir: number[] = forecast.hourly?.temperature_2m ?? [];
  const fcWind: number[] = forecast.hourly?.wind_speed_10m ?? [];
  const fcWindDir: number[] = forecast.hourly?.wind_direction_10m ?? [];
  const fcWxCode: number[] = forecast.hourly?.weather_code ?? [];

  const mTimes: string[] = marine.hourly?.time ?? [];
  const mSst: (number | null)[] = marine.hourly?.sea_surface_temperature ?? [];
  const mWave: (number | null)[] = marine.hourly?.wave_height ?? [];

  const marineByTime = new Map<string, { sst: number | null; wave: number | null }>();
  for (let i = 0; i < mTimes.length; i++) {
    marineByTime.set(mTimes[i], {
      sst: nullableNumber(mSst[i]),
      wave: nullableNumber(mWave[i]),
    });
  }

  const out: HourlySnapshot[] = [];
  for (let i = 0; i < fcTimes.length; i++) {
    const t = fcTimes[i];
    const m = marineByTime.get(t);
    out.push({
      time: t,
      airTempF: fcAir[i],
      windMph: fcWind[i],
      windDirectionDeg: fcWindDir[i],
      weatherCode: fcWxCode[i],
      waterTempF: m?.sst ?? null,
      waveHeightFt: m?.wave ?? null,
    });
  }
  return out;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildTide(marine: any): TidePoint[] {
  const times: string[] = marine.hourly?.time ?? [];
  const heights: (number | null)[] = marine.hourly?.sea_level_height_msl ?? [];
  const out: TidePoint[] = [];
  for (let i = 0; i < times.length; i++) {
    const h = nullableNumber(heights[i]);
    if (h != null) {
      out.push({ time: times[i], heightFt: h });
    }
  }
  return out;
}

function nullableNumber(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}
