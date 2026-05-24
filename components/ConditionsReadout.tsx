import type { Conditions } from '@/lib/types';
import { celsiusFromF, compassBearing, weatherDescription } from '@/lib/weather';
import { CompassRose } from './CompassRose';

interface Props {
  c: Conditions;
}

export function ConditionsReadout({ c }: Props) {
  const weather = weatherDescription(c.weatherCode);

  return (
    <div className="border border-ink/20 bg-parchment-light/40">
      <div className="grid grid-cols-2 divide-y divide-x divide-ink/15 md:grid-cols-4 md:divide-y-0">
        <Cell
          label="Water"
          value={c.waterTempF != null ? Math.round(c.waterTempF).toString() : '—'}
          unit="°F"
          aside={
            c.waterTempF != null
              ? `${celsiusFromF(c.waterTempF)}°C · sea surface`
              : 'No marine telemetry at this position'
          }
        />
        <Cell
          label="Air"
          value={Math.round(c.airTempF).toString()}
          unit="°F"
          aside={`Feels ${Math.round(c.feelsLikeF)}°F · ${weather.label}`}
        />
        <Cell
          label="Wind"
          value={Math.round(c.windMph).toString()}
          unit="mph"
          aside={`${compassBearing(c.windDirectionDeg)} · ${Math.round(c.windDirectionDeg)}°`}
          extra={
            <CompassRose
              bearing={c.windDirectionDeg}
              className="absolute right-5 top-5 h-12 w-12 text-ink/55"
            />
          }
        />
        <Cell
          label="Swell"
          value={c.waveHeightFt != null ? c.waveHeightFt.toFixed(1) : '—'}
          unit="ft"
          aside={
            c.wavePeriodS != null
              ? `${c.wavePeriodS.toFixed(1)}s period · ${
                  c.waveDirectionDeg != null ? compassBearing(c.waveDirectionDeg) : '—'
                }`
              : 'No swell telemetry'
          }
        />
      </div>
      <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-t border-ink/15 px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-ink/55">
        <span>
          Humidity {Math.round(c.humidity)}% · Pressure {Math.round(c.pressureHpa)} hPa ·
          Precipitation {c.precipitationMm.toFixed(1)} mm/hr
        </span>
        <span>
          Sample {c.timestamp.replace('T', ' ')} · {tzShort(c.timezone)}
        </span>
      </div>
    </div>
  );
}

interface CellProps {
  label: string;
  value: string;
  unit: string;
  aside?: string;
  extra?: React.ReactNode;
}

function Cell({ label, value, unit, aside, extra }: CellProps) {
  return (
    <div className="relative p-6 md:p-8">
      <div className="mb-3 font-mono text-[10px] uppercase tracking-ultra text-ink/55">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="tabular font-display text-[clamp(3rem,7vw,5.5rem)] leading-none">
          {value}
        </span>
        <span className="font-serif text-xl text-ink/60">{unit}</span>
      </div>
      {aside && (
        <div className="mt-3 font-serif text-sm italic text-ink/65">{aside}</div>
      )}
      {extra}
    </div>
  );
}

function tzShort(tz: string) {
  return tz.split('/').pop() ?? tz;
}
