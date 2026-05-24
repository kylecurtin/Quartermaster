# Quartermaster

A surf-provisions dispatch: real-time wetsuit and accessory recommendations
based on live water-surface temperature, air temperature, wind, and swell.
Default port is **Lido Beach, New York** — search any coastline worldwide.

Designed as a vintage maritime almanac. Built with Next.js 14 (App Router),
TypeScript, and Tailwind. All data is pulled live from
[Open-Meteo](https://open-meteo.com/) — **no API keys required**.

## Quickstart

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Deploy

The app has no environment variables or build-time secrets. One-click on Vercel
or any Node host that supports Next.js 14:

```bash
npx vercel --prod
```

## Data sources

| Source                          | Endpoint                                      |
| ------------------------------- | --------------------------------------------- |
| Sea-surface temp, waves, swell  | `marine-api.open-meteo.com/v1/marine`         |
| Air temp, wind, weather code    | `api.open-meteo.com/v1/forecast`              |
| Place search (any location)     | `geocoding-api.open-meteo.com/v1/search`      |

Server-rendered pages revalidate every 10 minutes; client-side searches fetch
fresh data on demand.

## Wetsuit logic

The recommendation is keyed off water-surface temperature, with wind-chill
adding a hood suggestion when the air is cold and gusty. See `lib/gear.ts`.

| Water (°F) | Suit                            |
| ---------- | ------------------------------- |
| 75+        | Boardshorts                     |
| 70–74      | 2 mm springsuit                 |
| 65–69      | 2 mm spring or 3/2 mm fullsuit  |
| 60–64      | 3/2 mm fullsuit                 |
| 55–59      | 4/3 mm fullsuit + booties       |
| 48–54      | 5/4 mm hooded + booties + gloves|
| 40–47      | 6/5/4 mm hooded + 7 mm booties  |
| < 40       | 6/5/4 mm hooded — extreme cold  |

## Project layout

```
app/            Next.js routes
components/     React components
lib/            API client, recommendation logic, weather codes
public/         Favicon
```

## License

MIT.
