import type { Conditions } from '@/lib/types';
import { recommendGear } from '@/lib/gear';

interface Props {
  conditions: Conditions;
}

export function GearDispatch({ conditions }: Props) {
  const rec = recommendGear(conditions.waterTempF, conditions.airTempF, conditions.windMph);

  if (!rec) {
    return (
      <div className="border border-ink/20 bg-parchment-light p-10">
        <p className="font-serif text-lg italic text-ink/75">
          Marine telemetry for this position is unavailable and no air reading came through —
          cross-reference with a nearby NDBC buoy before suiting up.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-ink/25 bg-parchment-light shadow-dispatch">
      <div className="grid gap-0 md:grid-cols-[1.25fr_1fr]">
        <div className="border-b border-ink/15 p-8 md:border-b-0 md:border-r md:p-12">
          <div className="mb-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-ultra text-ink/55">
            <span>The Order</span>
            <span className="h-px flex-1 bg-ink/15" />
            <span className="text-copper">{labelForBand(rec.band)}</span>
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <span className="tabular font-display text-[clamp(5rem,15vw,11rem)] leading-[0.85] text-ink">
              {rec.thickness}
            </span>
            <span className="font-serif text-2xl italic text-ink/70 md:text-3xl">
              {rec.unit}
            </span>
          </div>

          <p className="mt-6 max-w-md font-serif text-lg leading-relaxed text-ink/85">
            {rec.description}
          </p>

          {rec.warning && (
            <div className="mt-6 border-l-2 border-rust pl-4 py-1">
              <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-rust">
                Advisory
              </div>
              <p className="font-serif italic text-ink/85">{rec.warning}</p>
            </div>
          )}
        </div>

        <div className="p-8 md:p-12">
          <div className="mb-5 font-mono text-[10px] uppercase tracking-ultra text-ink/55">
            Inventory
          </div>
          <ul className="space-y-3.5">
            {rec.items.map((item, i) => (
              <li key={i}>
                <div
                  className={
                    item.required
                      ? 'font-serif text-lg leading-tight text-ink'
                      : 'font-serif text-lg font-light leading-tight text-ink/55'
                  }
                >
                  {item.name}
                  <span className="sr-only">{item.required ? ' (required)' : ' (optional)'}</span>
                  {!item.required && (
                    <span
                      aria-hidden
                      className="ml-2 font-mono text-[9px] uppercase tracking-widest text-ink/40"
                    >
                      optional
                    </span>
                  )}
                </div>
                {item.note && (
                  <div className="mt-0.5 font-serif text-sm italic text-ink/55">
                    {item.note}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-t border-ink/15 px-8 py-3 font-mono text-[10px] uppercase tracking-widest text-ink/55">
        <span>
          Issued on water{' '}
          <span className="tabular text-ink/85">
            {conditions.waterTempF != null
              ? `${Math.round(conditions.waterTempF)}°F`
              : '— (air proxy)'}
          </span>{' '}
          · air <span className="tabular text-ink/85">{Math.round(conditions.airTempF)}°F</span> ·
          wind <span className="tabular text-ink/85">{Math.round(conditions.windMph)} mph</span>
        </span>
        <span>· Quartermaster&rsquo;s stores ·</span>
      </div>
    </div>
  );
}

function labelForBand(band: string): string {
  return band.replace('-', ' ');
}
