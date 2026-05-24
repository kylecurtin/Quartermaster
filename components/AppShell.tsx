'use client';

import { useEffect, useState } from 'react';
import type { Conditions, Location } from '@/lib/types';
import { fetchConditions } from '@/lib/api';
import { weatherDescription } from '@/lib/weather';
import { ConditionsReadout } from './ConditionsReadout';
import { GearDispatch } from './GearDispatch';
import { LocationSearch } from './LocationSearch';

interface Props {
  initialLocation: Location;
  initialData: Conditions | null;
}

export function AppShell({ initialLocation, initialData }: Props) {
  const [location, setLocation] = useState<Location>(initialLocation);
  const [conditions, setConditions] = useState<Conditions | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    initialData ? null : 'Initial telemetry unavailable — retrying',
  );
  const [dispatchNow, setDispatchNow] = useState<Date | null>(null);

  // Defer Date() to client to avoid SSR/CSR hydration mismatch
  useEffect(() => {
    setDispatchNow(new Date());
  }, []);

  useEffect(() => {
    document.title = `Quartermaster · ${location.name}`;
  }, [location.name]);

  useEffect(() => {
    if (!initialData) {
      void load(initialLocation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load(loc: Location) {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchConditions(loc.latitude, loc.longitude);
      setConditions(data);
      setDispatchNow(new Date());
    } catch {
      setError('Telemetry temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  }

  function selectLocation(newLoc: Location) {
    setLocation(newLoc);
    void load(newLoc);
  }

  const weather = conditions ? weatherDescription(conditions.weatherCode) : null;
  const dispatchNo = dispatchNow ? formatDispatchNumber(dispatchNow) : '————.———.————';

  return (
    <div className="min-h-screen w-full">
      {/* Top bar */}
      <header className="px-6 pb-6 pt-8 md:px-12 md:pt-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <Monogram />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-ultra text-ink/55">
                Office of the
              </div>
              <div className="font-display text-2xl leading-none tracking-[0.18em] md:text-3xl">
                QUARTERMASTER
              </div>
              <div className="mt-1 font-serif text-xs italic text-ink/55">
                surf provisions, dispatched per the sea
              </div>
            </div>
          </div>
          <div className="text-right font-mono text-[10px] uppercase tracking-widest text-ink/55">
            <div>Dispatch №{dispatchNo}</div>
            <div className="tabular mt-1">
              {fmtCoord(location.latitude, 'lat')} · {fmtCoord(location.longitude, 'lon')}
            </div>
            <div className="tabular mt-1">{dispatchNow ? fmtTime(dispatchNow) : '— : — HRS'}</div>
          </div>
        </div>
        <div className="dispatch-rule mt-8 text-ink/40" />
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-[1400px] px-6 pb-12 pt-2 md:px-12">
        <div className="rise rise-1 mb-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="font-mono text-[10px] uppercase tracking-ultra text-ink/55">
            Provisions dispatched from
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
            ⌖ {[location.admin1, location.country].filter(Boolean).join(' · ')}
          </span>
        </div>
        <h1 className="rise rise-2 font-display text-[clamp(3.5rem,12vw,11rem)] leading-[0.85] tracking-tight">
          {location.name}
        </h1>
        <div className="rise rise-3 mt-8 max-w-2xl">
          <LocationSearch currentLocation={location} onSelect={selectLocation} />
        </div>
      </section>

      {/* Recommendation — lead with the answer */}
      <section className="mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="rise rise-4">
          <SectionHeading
            eyebrow="I."
            title="Recommended Provisions"
            subtitle="from the stores"
            right={loading ? 'Updating…' : error ?? 'live · open-meteo.com'}
          />
          {conditions ? <GearDispatch conditions={conditions} /> : <GearSkeleton />}
        </div>
      </section>

      {/* Conditions — the evidence */}
      <section className="mx-auto mt-16 max-w-[1400px] px-6 md:px-12">
        <div className="rise rise-5">
          <SectionHeading
            eyebrow="II."
            title="Telemetry"
            subtitle={weather ? weather.label : 'Awaiting transmission…'}
          />
          {conditions ? <ConditionsReadout c={conditions} /> : <ConditionsSkeleton />}
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto mb-10 mt-24 max-w-[1400px] px-6 md:px-12">
        <div className="dispatch-rule mb-6 text-ink/40" />
        <div className="flex flex-col items-start justify-between gap-3 font-mono text-[10px] uppercase tracking-widest text-ink/55 md:flex-row md:items-center">
          <div>Compiled from buoy &amp; atmospheric telemetry · Open-Meteo · WMO</div>
          <div>Quartermaster</div>
        </div>
      </footer>
    </div>
  );
}

function Monogram() {
  return (
    <svg
      viewBox="0 0 60 60"
      className="h-12 w-12 text-copper"
      aria-label="Quartermaster monogram"
    >
      <circle cx="30" cy="30" r="27" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <circle
        cx="30"
        cy="30"
        r="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.4"
        opacity="0.6"
      />
      <g stroke="currentColor" strokeWidth="0.6" fill="none">
        <line x1="30" y1="6" x2="30" y2="54" />
        <line x1="6" y1="30" x2="54" y2="30" />
      </g>
      <g stroke="currentColor" strokeWidth="0.35" fill="none" opacity="0.6">
        <line x1="13" y1="13" x2="47" y2="47" />
        <line x1="47" y1="13" x2="13" y2="47" />
      </g>
      <polygon points="30,9 33,30 30,27 27,30" fill="currentColor" />
      <polygon points="30,51 27,30 30,33 33,30" fill="currentColor" opacity="0.45" />
      <circle cx="30" cy="30" r="2" fill="currentColor" />
      <text
        x="30"
        y="6.5"
        textAnchor="middle"
        fontSize="4.5"
        fill="currentColor"
        fontFamily="var(--font-mono), monospace"
      >
        N
      </text>
    </svg>
  );
}

interface HeadingProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  right?: string;
}

function SectionHeading({ eyebrow, title, subtitle, right }: HeadingProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="flex items-baseline gap-4">
        <span className="font-display text-3xl text-copper">{eyebrow}</span>
        <div>
          <h2 className="font-serif text-2xl text-ink md:text-3xl">{title}</h2>
          {subtitle && (
            <div className="mt-1 font-serif italic text-ink/60">{subtitle}</div>
          )}
        </div>
      </div>
      {right && (
        <div className="shimmer font-mono text-[10px] uppercase tracking-widest text-ink/50">
          {right}
        </div>
      )}
    </div>
  );
}

function ConditionsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-px border border-ink/15 bg-ink/15 md:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-44 animate-pulse bg-parchment/80" />
      ))}
    </div>
  );
}

function GearSkeleton() {
  return (
    <div className="h-64 animate-pulse border border-ink/15 bg-parchment-light/60" />
  );
}

function formatDispatchNumber(d: Date) {
  const y = d.getFullYear();
  const doy = Math.floor((d.getTime() - new Date(y, 0, 0).getTime()) / 86_400_000);
  const t = `${d.getHours().toString().padStart(2, '0')}${d
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
  return `${y}.${doy.toString().padStart(3, '0')}.${t}`;
}

function fmtCoord(v: number, kind: 'lat' | 'lon') {
  const abs = Math.abs(v);
  const deg = Math.floor(abs);
  const min = Math.floor((abs - deg) * 60);
  const sec = ((abs - deg) * 60 - min) * 60;
  const hemi = kind === 'lat' ? (v >= 0 ? 'N' : 'S') : (v >= 0 ? 'E' : 'W');
  return `${deg}°${min.toString().padStart(2, '0')}′${sec.toFixed(1)}″${hemi}`;
}

function fmtTime(d: Date) {
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m} HRS`;
}
