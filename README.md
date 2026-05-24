# Quartermaster

> **Live:** [quartermaster-azure.vercel.app](https://quartermaster-azure.vercel.app)

A surf-provisions dispatch: real-time wetsuit and accessory recommendations
based on live water-surface temperature, air temperature, wind, swell, and
tide. Default port is **Lido Beach, New York** — search any coastline
worldwide, save favorites to your **ledger**.

Designed as a vintage maritime almanac in deep-water blue. Built with
Next.js 14 (App Router), TypeScript, and Tailwind. All data is pulled live
from [Open-Meteo](https://open-meteo.com/) — **no API keys required**.

## Features

- **Recommended provisions** keyed to live water temperature, with
  wind-chill and cold-air-over-warm-water modifiers, plus an air-temp
  proxy when sea-surface telemetry is unavailable
- **Telemetry readout** — water, air, wind, swell, plus a 24-hour tide
  sparkline with high/low markers
- **Tomorrow at dawn** — hourly forecast columns 05:00–10:00 with a
  per-hour wetsuit recommendation and a "prime hour" callout
- **Ledger** — save any coastline to localStorage; saved spots appear in
  the search dropdown when it's empty
- **Combobox keyboard navigation** — arrow keys, Enter, Escape
- Accessible: ARIA combobox roles, `aria-activedescendant`, screen-reader
  hints on gear required vs. optional

## Quickstart

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Deploy

The app has no environment variables or build-time secrets. One-click on
Vercel or any Node host that supports Next.js 14:

```bash
npx vercel --prod
```

## Data sources

| Source                                | Endpoint                                      |
| ------------------------------------- | --------------------------------------------- |
| Sea-surface temp, waves, swell, tide  | `marine-api.open-meteo.com/v1/marine`         |
| Air temp, wind, weather, hourly       | `api.open-meteo.com/v1/forecast`              |
| Place search (any location)           | `geocoding-api.open-meteo.com/v1/search`      |

Server-rendered pages revalidate every 10 minutes; client-side searches
fetch fresh data on demand.

## Wetsuit logic

The base recommendation is keyed off water-surface temperature, with
modifier passes applied for wind chill and cold-air-over-warmer-water
mornings. See `lib/gear.ts`.

| Water (°F) | Suit                              |
| ---------- | --------------------------------- |
| 75+        | Boardshorts                       |
| 70–74      | 2 mm springsuit                   |
| 65–69      | 2 mm spring or 3/2 mm fullsuit    |
| 60–64      | 3/2 mm fullsuit                   |
| 55–59      | 4/3 mm fullsuit + booties         |
| 48–54      | 5/4 mm hooded + booties + gloves  |
| 40–47      | 6/5/4 mm hooded + 7 mm booties    |
| < 40       | 6/5/4 mm hooded — extreme cold    |

When sea-surface temperature is unavailable for a position, the
recommendation falls back to air temperature as a ballpark proxy and
surfaces the fallback honestly in the dispatch copy.

## Project layout

```
app/             Next.js routes + global styles
components/      React components
  AppShell.tsx     Main page composition
  ConditionsReadout.tsx
  GearDispatch.tsx
  TomorrowDispatch.tsx    Section III (dawn-patrol hourly)
  TideSparkline.tsx       Inline tide curve
  LocationSearch.tsx      Combobox w/ ledger integration
  CompassRose.tsx
lib/             API client, recommendation logic, weather codes, ledger
public/          Favicon
```

## Design notes

The app was built iteratively in a single Claude Code session and shaped
by two opinionated reviews — one engineering-focused, one design-focused —
applied as a full action pass:

- **Engineering pass:** Air-temperature fallback when SST is unavailable,
  wind-chill modifiers that fire across all bands (not just one), proper
  ARIA combobox keyboard navigation with `AbortController` for stale
  debounced fetches, UTC dispatch numbers, seconds-overflow correction in
  DMS coordinate formatting.
- **Design pass:** Lead with the answer (wetsuit recommendation above the
  telemetry, not below it), trim the costume (no decorative corner-marks,
  no Roman-numeral year in the footer, no glyph bullets for required vs.
  optional — typography carries that distinction), add tomorrow.

The "tomorrow" addition is the killer feature: surfers decide about dawn
patrol the night before, not the morning of.

## License

MIT.
