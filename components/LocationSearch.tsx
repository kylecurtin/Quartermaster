'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { GeocodingResult, Location } from '@/lib/types';

interface Props {
  currentLocation: Location;
  onSelect: (location: Location) => void;
}

const LISTBOX_ID = 'qm-location-listbox';

export function LocationSearch({ currentLocation, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setActiveIndex(-1);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          query,
        )}&count=6&language=en`,
        { signal: controller.signal },
      )
        .then((res) => res.json())
        .then((data) => {
          if (!controller.signal.aborted) {
            setResults((data.results as GeocodingResult[]) ?? []);
          }
        })
        .catch((err) => {
          if (err?.name !== 'AbortError') {
            setResults([]);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        });
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
    setActiveIndex(-1);
    setResults([]);
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && results[activeIndex]) {
        e.preventDefault();
        handleSelect(results[activeIndex]);
      }
    }
  }

  const expanded = open && results.length > 0;

  return (
    <div className="relative">
      <div className="flex items-center gap-3 border-b border-ink/40 pb-2 transition-colors focus-within:border-ink">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Delay close so a click on a listbox option can still register.
            setTimeout(() => setOpen(false), 150);
          }}
          onKeyDown={handleKey}
          placeholder={`any harbor, point, or beach — currently ${currentLocation.name.toLowerCase()}`}
          role="combobox"
          aria-expanded={expanded}
          aria-controls={LISTBOX_ID}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${LISTBOX_ID}-${activeIndex}` : undefined
          }
          aria-label="Search for a coastal location"
          className="flex-1 border-0 bg-transparent py-1 font-serif text-lg italic placeholder:text-ink/35 focus:outline-none"
        />
        {loading && (
          <span className="font-mono text-[10px] tracking-widest text-ink/50">··· searching</span>
        )}
      </div>

      {expanded && (
        <ul
          role="listbox"
          id={LISTBOX_ID}
          className="absolute left-0 right-0 top-full z-20 mt-2 max-h-80 overflow-y-auto border border-ink/25 bg-parchment-light shadow-dispatch"
        >
          {results.map((r, i) => (
            <li
              key={`${r.latitude}-${r.longitude}-${i}`}
              id={`${LISTBOX_ID}-${i}`}
              role="option"
              aria-selected={activeIndex === i}
              className={`border-b border-ink/10 last:border-b-0 ${
                activeIndex === i ? 'bg-ink/[0.08]' : ''
              }`}
            >
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(r);
                }}
                onMouseEnter={() => setActiveIndex(i)}
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
