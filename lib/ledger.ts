'use client';

import { useEffect, useState } from 'react';
import type { Location } from './types';
import { LIDO_BEACH } from './types';

const KEY = 'qm.ledger.v1';

function locEq(a: Location, b: Location): boolean {
  return Math.abs(a.latitude - b.latitude) < 1e-4 && Math.abs(a.longitude - b.longitude) < 1e-4;
}

export function useLedger() {
  const [spots, setSpots] = useState<Location[]>([LIDO_BEACH]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed: Location[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSpots(parsed);
        }
      }
    } catch {
      // ignore — bad JSON or storage disabled
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(spots));
    } catch {
      // ignore — storage full or blocked
    }
  }, [spots, loaded]);

  function save(loc: Location) {
    setSpots((prev) => (prev.some((s) => locEq(s, loc)) ? prev : [...prev, loc]));
  }

  function remove(loc: Location) {
    setSpots((prev) => prev.filter((s) => !locEq(s, loc)));
  }

  function isSaved(loc: Location): boolean {
    return spots.some((s) => locEq(s, loc));
  }

  return { spots, loaded, save, remove, isSaved };
}
