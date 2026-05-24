interface Props {
  bearing: number;
  className?: string;
}

export function CompassRose({ bearing, className }: Props) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="0.6" />
      <circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" strokeWidth="0.35" opacity="0.55" />

      {/* Tick marks */}
      <g stroke="currentColor" strokeWidth="0.45" opacity="0.7">
        <line x1="24" y1="3" x2="24" y2="7" />
        <line x1="24" y1="41" x2="24" y2="45" />
        <line x1="3" y1="24" x2="7" y2="24" />
        <line x1="41" y1="24" x2="45" y2="24" />
      </g>
      <g stroke="currentColor" strokeWidth="0.3" opacity="0.45">
        <line x1="9" y1="9" x2="11.5" y2="11.5" />
        <line x1="36.5" y1="36.5" x2="39" y2="39" />
        <line x1="36.5" y1="11.5" x2="39" y2="9" />
        <line x1="9" y1="39" x2="11.5" y2="36.5" />
      </g>

      <text
        x="24"
        y="9"
        textAnchor="middle"
        fontSize="4.5"
        fill="currentColor"
        fontFamily="var(--font-mono), monospace"
        letterSpacing="0.05em"
      >
        N
      </text>

      {/* Bearing arrow — points TOWARD the direction of origin (meteorological convention) */}
      <g transform={`rotate(${bearing} 24 24)`}>
        <polygon
          points="24,7 21.5,24 24,21.5 26.5,24"
          fill="currentColor"
        />
        <polygon
          points="24,41 26.5,24 24,26.5 21.5,24"
          fill="currentColor"
          opacity="0.4"
        />
      </g>
    </svg>
  );
}
