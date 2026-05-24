export interface WeatherInfo {
  label: string;
  symbol: string;
}

const WMO: Record<number, WeatherInfo> = {
  0: { label: 'Clear skies', symbol: '☼' },
  1: { label: 'Mostly clear', symbol: '◐' },
  2: { label: 'Partly cloudy', symbol: '☁' },
  3: { label: 'Overcast', symbol: '☁' },
  45: { label: 'Fog', symbol: '≋' },
  48: { label: 'Rime fog', symbol: '≋' },
  51: { label: 'Light drizzle', symbol: '⋅⋅' },
  53: { label: 'Drizzle', symbol: '⋅⋅' },
  55: { label: 'Heavy drizzle', symbol: '⋅⋅' },
  56: { label: 'Freezing drizzle', symbol: '❄' },
  57: { label: 'Freezing drizzle', symbol: '❄' },
  61: { label: 'Light rain', symbol: '☂' },
  63: { label: 'Rain', symbol: '☂' },
  65: { label: 'Heavy rain', symbol: '☂' },
  66: { label: 'Freezing rain', symbol: '❄' },
  67: { label: 'Freezing rain', symbol: '❄' },
  71: { label: 'Light snow', symbol: '❄' },
  73: { label: 'Snow', symbol: '❄' },
  75: { label: 'Heavy snow', symbol: '❄' },
  77: { label: 'Snow grains', symbol: '❄' },
  80: { label: 'Rain showers', symbol: '☂' },
  81: { label: 'Heavy showers', symbol: '☂' },
  82: { label: 'Violent showers', symbol: '☂' },
  85: { label: 'Snow showers', symbol: '❄' },
  86: { label: 'Heavy snow showers', symbol: '❄' },
  95: { label: 'Thunderstorm', symbol: '⚡' },
  96: { label: 'Thunderstorm w/ hail', symbol: '⚡' },
  99: { label: 'Severe thunderstorm', symbol: '⚡' },
};

export function weatherDescription(code: number): WeatherInfo {
  return WMO[code] ?? { label: 'Unknown', symbol: '·' };
}

const COMPASS_16 = [
  'N', 'NNE', 'NE', 'ENE',
  'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW',
  'W', 'WNW', 'NW', 'NNW',
];

export function compassBearing(deg: number): string {
  const ix = Math.round(((deg % 360) + 360) / 22.5) % 16;
  return COMPASS_16[ix];
}

export function celsiusFromF(f: number): number {
  return Math.round(((f - 32) * 5) / 9);
}
