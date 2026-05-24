import type { HourlySnapshot } from '@/lib/types';
import { recommendGear } from '@/lib/gear';
import { compassBearing, weatherDescription } from '@/lib/weather';

interface Props {
  hourly: HourlySnapshot[];
  currentTime: string;
}

const DAWN_HOURS = [5, 6, 7, 8, 9, 10];

export function TomorrowDispatch({ hourly, currentTime }: Props) {
  const tomorrow = nextDayString(currentTime);

  const window = hourly.filter((h) => {
    if (h.time.slice(0, 10) !== tomorrow) return false;
    const hr = parseInt(h.time.slice(11, 13), 10);
    return DAWN_HOURS.includes(hr);
  });

  if (window.length === 0) {
    return (
      <div className="border border-ink/20 bg-parchment-light/40 p-8">
        <p className="font-serif italic text-ink/65">
          Forward forecast is not yet available for this position. Try again closer to dawn.
        </p>
      </div>
    );
  }

  // Prime hour = lowest wind speed within the window (cleanest air-water surface)
  const primeIdx = window.reduce(
    (best, h, i) => (h.windMph < window[best].windMph ? i : best),
    0,
  );

  return (
    <div className="border border-ink/25 bg-parchment-light/40 shadow-dispatch">
      <div className="overflow-x-auto">
        <div className={`grid min-w-[640px] grid-cols-${window.length} divide-x divide-ink/15`}
             style={{ gridTemplateColumns: `repeat(${window.length}, minmax(0, 1fr))` }}>
          {window.map((h, i) => {
            const rec = recommendGear(h.waterTempF, h.airTempF, h.windMph);
            const wx = weatherDescription(h.weatherCode);
            const isPrime = i === primeIdx;
            const time = h.time.slice(11, 16);
            return (
              <div
                key={h.time}
                className={`relative px-4 py-6 md:px-5 md:py-7 ${
                  isPrime ? 'bg-copper/[0.08]' : ''
                }`}
              >
                {isPrime && (
                  <div className="absolute -top-px left-0 right-0 flex justify-center">
                    <span className="bg-parchment px-3 py-0.5 font-mono text-[9px] uppercase tracking-ultra text-copper">
                      prime
                    </span>
                  </div>
                )}
                <div className="mb-3 flex items-baseline justify-between">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-ink/55 tabular">
                    {time}
                  </div>
                  <div
                    className="font-mono text-base leading-none text-ink/65"
                    aria-label={wx.label}
                    title={wx.label}
                  >
                    {wx.symbol}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="tabular font-display text-4xl leading-none text-ink md:text-5xl">
                    {rec?.thickness ?? '—'}
                  </div>
                  <div className="mt-1 font-serif text-xs italic text-ink/55">
                    {shortUnit(rec?.unit)}
                  </div>
                </div>

                <dl className="space-y-1 font-mono text-[10px] uppercase tracking-wide text-ink/70">
                  <Row label="water" value={h.waterTempF != null ? `${Math.round(h.waterTempF)}°F` : '—'} />
                  <Row label="air" value={`${Math.round(h.airTempF)}°F`} />
                  <Row
                    label="wind"
                    value={`${compassBearing(h.windDirectionDeg)} ${Math.round(h.windMph)}`}
                  />
                  <Row
                    label="wave"
                    value={h.waveHeightFt != null ? `${h.waveHeightFt.toFixed(1)}ft` : '—'}
                  />
                </dl>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-t border-ink/15 px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-ink/55">
        <span>
          {prettyDate(tomorrow)} · dawn window {DAWN_HOURS[0]}:00–{DAWN_HOURS[DAWN_HOURS.length - 1]}:00
          local
        </span>
        <span className="text-copper">
          prime hour ·{' '}
          <span className="tabular">{window[primeIdx].time.slice(11, 16)}</span>
        </span>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-ink/40">{label}</dt>
      <dd className="tabular text-ink/85">{value}</dd>
    </div>
  );
}

function shortUnit(unit: string | undefined): string {
  if (!unit) return '';
  if (unit.includes('—')) return unit.split('—')[1].trim();
  return unit;
}

function nextDayString(currentTime: string): string {
  const datePart = currentTime.slice(0, 10);
  const [y, m, d] = datePart.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + 1);
  return dt.toISOString().slice(0, 10);
}

function prettyDate(yyyymmdd: string): string {
  const [y, m, d] = yyyymmdd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dt.getUTCDay()];
  const mo = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ][m - 1];
  return `${wd} · ${mo} ${d}`;
}
