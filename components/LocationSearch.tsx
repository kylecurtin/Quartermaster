'use client';

import { useEffect, useRef, useState } from 'react';
import type { GeocodingResult, Location } from '@/lib/types';

interface Props {
  currentLocation: Location;
  onSelect: (location: Location) => void;
}

export function LocationSearch({ currentLocation, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            query,
          )}&count=6&language=en`,
        );
        const data = await res.json();
        setResults((data.results as GeocodingResult[]) ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  function handleSelect(r: GeocodingResult) {
    onSelect({
      name: r.name,
      admin1: r.admin1,
      country: r.country,
      latitude: r.latitude,
      longitude: r.longitude,
    });
    setQuery('');
    setOpen(false);
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-3 border-b border-ink/40 pb-2 transition-colors focus-within:border-ink">
        <span className="select-none font-mono text-[10px] uppercase tracking-ultra text-ink/55">
          ↳ Reroute to
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            setTimeout(() => setOpen(false), 180);
          }}
          placeholder={`any harbor, point, or beach — currently ${currentLocation.name.toLowerCase()}`}
          aria-label="Search for a coastal location"
          className="flex-1 border-0 bg-transparent py-1 font-serif text-lg italic placeholder:text-ink/35 focus:outline-none"
        />
        {loading && (
          <span className="font-mono text-[10px] tracking-widest text-ink/50">··· searching</span>
        )}
      </div>

      {open && results.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-2 max-h-80 overflow-y-auto border border-ink/25 bg-parchment shadow-dispatch"
        >
          {results.map((r, i) => (
            <li
              key={`${r.latitude}-${r.longitude}-${i}`}
              className="border-b border-ink/10 last:border-b-0"
            >
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(r);
                }}
                className="flex w-full items-baseline justify-between gap-4 px-5 py-3 text-left transition-colors hover:bg-ink/[0.04]"
              >
                <span>
                  <span className="font-serif text-base text-ink">{r.name}</span>
                  <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-ink/55">
                    {[r.admin1, r.country].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <span className="tabular font-mono text-[10px] text-ink/40">
                  {r.latitude.toFixed(2)}, {r.longitude.toFixed(2)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
