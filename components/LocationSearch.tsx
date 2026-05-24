'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { GeocodingResult, Location } from '@/lib/types';

interface Props {
  currentLocation: Location;
  ledger: Location[];
  onSelect: (location: Location) => void;
  onRemoveFromLedger?: (location: Location) => void;
}

const LISTBOX_ID = 'qm-location-listbox';

interface OptionRow {
  kind: 'ledger' | 'search';
  location: Location;
  // For search results: extra metadata
  raw?: GeocodingResult;
}

export function LocationSearch({
  currentLocation,
  ledger,
  onSelect,
  onRemoveFromLedger,
}: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>();
  const abortRef = useRef<AbortController | null>(null);

  const trimmed = query.trim();

  useEffect(() => {
    setActiveIndex(-1);
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
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
          trimmed,
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
  }, [trimmed]);

  const rows: OptionRow[] =
    trimmed.length < 2
      ? ledger.map((l) => ({ kind: 'ledger', location: l }))
      : results.map((r) => ({
          kind: 'search',
          location: {
            name: r.name,
            admin1: r.admin1,
            country: r.country,
            latitude: r.latitude,
            longitude: r.longitude,
          },
          raw: r,
        }));

  const expanded = open && rows.length > 0;

  function handleSelect(loc: Location) {
    onSelect(loc);
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
    if (rows.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i + 1) % rows.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i <= 0 ? rows.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && rows[activeIndex]) {
        e.preventDefault();
        handleSelect(rows[activeIndex].location);
      }
    }
  }

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
          aria-label="Search for a coastal location, or browse your ledger"
          className="flex-1 border-0 bg-transparent py-1 font-serif text-lg italic placeholder:text-ink/35 focus:outline-none"
        />
        {loading && (
          <span className="font-mono text-[10px] tracking-widest text-ink/50">··· searching</span>
        )}
      </div>

      {expanded && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 border border-ink/25 bg-parchment-light shadow-dispatch">
          {trimmed.length < 2 && (
            <div className="border-b border-ink/15 px-5 py-2 font-mono text-[10px] uppercase tracking-ultra text-ink/55">
              Ledger · saved spots
            </div>
          )}
          <ul role="listbox" id={LISTBOX_ID} className="max-h-80 overflow-y-auto">
            {rows.map((row, i) => {
              const loc = row.location;
              return (
                <li
                  key={`${row.kind}-${loc.latitude}-${loc.longitude}-${i}`}
                  id={`${LISTBOX_ID}-${i}`}
                  role="option"
                  aria-selected={activeIndex === i}
                  className={`border-b border-ink/10 last:border-b-0 ${
                    activeIndex === i ? 'bg-ink/[0.08]' : ''
                  }`}
                >
                  <div className="group flex items-center">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelect(loc);
                      }}
                      onMouseEnter={() => setActiveIndex(i)}
                      className="flex flex-1 items-baseline justify-between gap-4 px-5 py-3 text-left transition-colors hover:bg-ink/[0.04]"
                    >
                      <span>
                        <span className="font-serif text-base text-ink">{loc.name}</span>
                        <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-ink/55">
                          {[loc.admin1, loc.country].filter(Boolean).join(' · ')}
                        </span>
                      </span>
                      <span className="tabular font-mono text-[10px] text-ink/40">
                        {loc.latitude.toFixed(2)}, {loc.longitude.toFixed(2)}
                      </span>
                    </button>
                    {row.kind === 'ledger' && onRemoveFromLedger && (
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          onRemoveFromLedger(loc);
                        }}
                        aria-label={`Remove ${loc.name} from ledger`}
                        className="px-3 py-3 font-mono text-[10px] uppercase tracking-widest text-ink/35 transition-colors hover:text-rust"
                      >
                        remove
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {trimmed.length >= 2 && rows.length === 0 && !loading && (
            <div className="px-5 py-4 font-serif italic text-ink/55">
              No harbor found by that name.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
