import type { TidePoint } from '@/lib/types';

interface Props {
  tide: TidePoint[];
  currentTime: string;
  className?: string;
}

interface PlottedPoint extends TidePoint {
  x: number;
  y: number;
  hour: number;
}

export function TideSparkline({ tide, currentTime, className }: Props) {
  const todayDate = currentTime.slice(0, 10);
  const todayPoints = tide.filter((t) => t.time.slice(0, 10) === todayDate);
  if (todayPoints.length < 8) return null;

  const heights = todayPoints.map((p) => p.heightFt);
  const min = Math.min(...heights);
  const max = Math.max(...heights);
  const range = max - min || 1;

  const w = 600;
  const h = 70;
  const padX = 6;
  const padY = 8;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;

  const plotted: PlottedPoint[] = todayPoints.map((p, i) => {
    const x = padX + (i / (todayPoints.length - 1)) * innerW;
    const y = padY + innerH - ((p.heightFt - min) / range) * innerH;
    const hour = parseInt(p.time.slice(11, 13), 10);
    return { ...p, x, y, hour };
  });

  const pathD = plotted
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');
  const fillD =
    pathD +
    ` L ${plotted[plotted.length - 1].x.toFixed(1)} ${padY + innerH} L ${plotted[0].x.toFixed(
      1,
    )} ${padY + innerH} Z`;

  // Detect local extrema
  const highs: PlottedPoint[] = [];
  const lows: PlottedPoint[] = [];
  for (let i = 1; i < plotted.length - 1; i++) {
    if (
      plotted[i].heightFt > plotted[i - 1].heightFt &&
      plotted[i].heightFt > plotted[i + 1].heightFt
    ) {
      highs.push(plotted[i]);
    }
    if (
      plotted[i].heightFt < plotted[i - 1].heightFt &&
      plotted[i].heightFt < plotted[i + 1].heightFt
    ) {
      lows.push(plotted[i]);
    }
  }

  const currentHourStr = currentTime.slice(0, 13);
  const nowIdx = plotted.findIndex((p) => p.time.slice(0, 13) === currentHourStr);
  const nowX = nowIdx >= 0 ? plotted[nowIdx].x : null;

  const currentHour = currentTime.slice(11, 13);
  const upcoming = [...highs, ...lows]
    .filter((p) => p.time.slice(11, 13) >= currentHour)
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 2);

  function fmtHr(p: PlottedPoint, isHigh: boolean) {
    return `${isHigh ? '↑' : '↓'} ${p.heightFt > 0 ? '+' : ''}${p.heightFt.toFixed(1)}ft @ ${p.time.slice(11, 16)}`;
  }

  return (
    <div className={className}>
      <div className="mb-2 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-ultra text-ink/55">
        <span>Tide · sea level vs. MSL</span>
        <span className="tabular text-ink/40">
          {todayDate} · range {(max - min).toFixed(1)}ft
        </span>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-16 w-full text-copper"
        preserveAspectRatio="none"
        role="img"
        aria-label="Today's tide curve"
      >
        {/* 6-hour gridlines */}
        <g stroke="currentColor" strokeWidth="0.3" opacity="0.18">
          {[6, 12, 18].map((hr) => {
            const x = padX + (hr / 23) * innerW;
            return <line key={hr} x1={x} y1={padY} x2={x} y2={padY + innerH} />;
          })}
        </g>
        {/* MSL baseline (height = 0) */}
        {min < 0 && max > 0 && (
          <line
            x1={padX}
            x2={padX + innerW}
            y1={padY + innerH - ((0 - min) / range) * innerH}
            y2={padY + innerH - ((0 - min) / range) * innerH}
            stroke="currentColor"
            strokeWidth="0.4"
            strokeDasharray="3 3"
            opacity="0.35"
          />
        )}
        {/* Filled area under curve */}
        <path d={fillD} fill="currentColor" opacity="0.10" />
        {/* Curve */}
        <path d={pathD} fill="none" stroke="currentColor" strokeWidth="1.3" />
        {/* High markers */}
        {highs.map((p, i) => (
          <circle key={`hi-${i}`} cx={p.x} cy={p.y} r="2.2" fill="currentColor" />
        ))}
        {/* Low markers */}
        {lows.map((p, i) => (
          <circle
            key={`lo-${i}`}
            cx={p.x}
            cy={p.y}
            r="2.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        ))}
        {/* "Now" marker */}
        {nowX !== null && (
          <g>
            <line
              x1={nowX}
              x2={nowX}
              y1={padY - 2}
              y2={padY + innerH + 2}
              stroke="currentColor"
              strokeWidth="0.8"
              opacity="0.7"
              strokeDasharray="2 2"
            />
            <text
              x={nowX}
              y={padY - 3}
              fontSize="5.5"
              textAnchor="middle"
              fill="currentColor"
              fontFamily="var(--font-mono), monospace"
              letterSpacing="0.05em"
            >
              NOW
            </text>
          </g>
        )}
        {/* Hour markers */}
        <g
          fill="currentColor"
          opacity="0.4"
          fontSize="4.5"
          fontFamily="var(--font-mono), monospace"
        >
          {[0, 6, 12, 18].map((hr) => (
            <text
              key={hr}
              x={padX + (hr / 23) * innerW}
              y={h - 1}
              textAnchor={hr === 0 ? 'start' : 'middle'}
            >
              {hr.toString().padStart(2, '0')}h
            </text>
          ))}
          <text x={padX + innerW} y={h - 1} textAnchor="end">
            23h
          </text>
        </g>
      </svg>
      {upcoming.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10px] uppercase tracking-widest text-ink/55">
          <span className="text-ink/40">Upcoming</span>
          {upcoming.map((p, i) => {
            const isHigh = highs.includes(p);
            return (
              <span key={i} className="tabular">
                <span className={isHigh ? 'text-copper' : 'text-ink/70'}>{fmtHr(p, isHigh)}</span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
