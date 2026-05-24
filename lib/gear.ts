export interface GearItem {
  name: string;
  required: boolean;
  note?: string;
}

export type GearBand =
  | 'tropical'
  | 'warm'
  | 'temperate'
  | 'cool'
  | 'cold'
  | 'very-cold'
  | 'arctic';

export interface Recommendation {
  wetsuit: string;
  thickness: string;
  unit: string;
  description: string;
  items: GearItem[];
  warning?: string;
  band: GearBand;
  proxy?: 'air-as-water';
}

export function recommendGear(
  waterTempF: number | null,
  airTempF: number,
  windMph: number,
): Recommendation | null {
  // Air-temp fallback when sea-surface telemetry is unavailable.
  // Water lags air seasonally — net ballpark within ~5°F for most coastal spots.
  let waterF = waterTempF;
  let usedAirAsProxy = false;
  if (waterF == null || Number.isNaN(waterF)) {
    if (Number.isFinite(airTempF)) {
      waterF = airTempF;
      usedAirAsProxy = true;
    } else {
      return null;
    }
  }

  const r = baseRecommendation(waterF);

  // ---- Modifier passes ---- //

  // 1. Wind + cool air calls for ear cover, regardless of band, when we
  //    don't already have a hood prescribed.
  if (windMph > 18 && airTempF < 60 && !hasHood(r)) {
    r.items.push({
      name: 'Neoprene hood',
      required: false,
      note: `Wind ${Math.round(windMph)} mph with ${Math.round(airTempF)}°F air will steal heat fast`,
    });
  }

  // 2. Cold air over warmer water (offshore dawn patrols in autumn). When
  //    the air is meaningfully colder than the water AND wind is up, the
  //    base band underestimates how cold you'll actually be. Nudge up.
  if (
    waterF >= 60 &&
    airTempF < waterF - 12 &&
    windMph > 12 &&
    r.band !== 'tropical'
  ) {
    r.items.push({
      name: 'A thicker suit, if you own one',
      required: false,
      note: `Air ${Math.round(airTempF)}°F vs water ${Math.round(
        waterF,
      )}°F + wind ${Math.round(windMph)} mph — your next-warmer suit will earn its keep`,
    });
  }

  // 3. Surface the proxy fallback honestly so the user can calibrate trust.
  if (usedAirAsProxy) {
    r.description = `Sea-surface telemetry is unavailable for this position, so this dispatch is reckoned from air temperature alone — treat it as a ballpark, not gospel. ${r.description}`;
    r.proxy = 'air-as-water';
  }

  return r;
}

function hasHood(r: Recommendation): boolean {
  return r.items.some((i) => i.name.toLowerCase().includes('hood'));
}

function baseRecommendation(waterTempF: number): Recommendation {
  if (waterTempF >= 75) {
    return {
      wetsuit: 'Boardshorts',
      thickness: '0',
      unit: 'mm — trunks only',
      description:
        'Bath-water conditions. Skip the neoprene altogether and let the sun do the work. Stay hydrated; reef-friendly sunscreen earns its keep on longer sessions.',
      items: [
        { name: 'Boardshorts or bikini', required: true },
        { name: 'Rashguard', required: false, note: 'UV + chafing protection' },
        { name: 'Reef-safe sunscreen', required: false },
      ],
      band: 'tropical',
    };
  }
  if (waterTempF >= 70) {
    return {
      wetsuit: 'Shorty / Springsuit',
      thickness: '2',
      unit: 'mm springsuit',
      description:
        'Light neoprene weather. A springsuit blocks the chill on dawn patrol without cooking you when the sun climbs.',
      items: [
        { name: '2mm springsuit', required: true },
        { name: 'Rashguard', required: false, note: 'Under the suit on long sessions' },
      ],
      band: 'warm',
    };
  }
  if (waterTempF >= 65) {
    return {
      wetsuit: '2mm Springsuit or 3/2mm Fullsuit',
      thickness: '3/2',
      unit: 'mm fullsuit',
      description:
        'Borderline. Choose the springsuit on warm afternoons; the 3/2 for a cold dawn patrol or a long session.',
      items: [
        { name: '3/2mm fullsuit', required: true, note: 'Default choice for water below 68°F' },
        { name: 'Springsuit', required: false, note: 'Substitute when air > 75°F' },
      ],
      band: 'warm',
    };
  }
  if (waterTempF >= 60) {
    return {
      wetsuit: '3/2mm Fullsuit',
      thickness: '3/2',
      unit: 'mm fullsuit',
      description:
        'Standard fullsuit conditions. Sealed seams earn their price tag if you stay in past an hour.',
      items: [
        { name: '3/2mm fullsuit', required: true },
        {
          name: '3mm booties',
          required: false,
          note: waterTempF < 62 ? 'Recommended below 62°F' : 'Optional',
        },
      ],
      band: 'temperate',
    };
  }
  if (waterTempF >= 55) {
    return {
      wetsuit: '4/3mm Fullsuit',
      thickness: '4/3',
      unit: 'mm fullsuit',
      description:
        'Cold enough that thickness and seam-sealing matter. Bring a towel, a thermos, and a friend who knows where the truck is parked.',
      items: [
        { name: '4/3mm fullsuit (sealed seams)', required: true },
        { name: '3mm booties', required: true },
        { name: '2mm hood', required: false, note: 'If wind is up or sessions exceed an hour' },
      ],
      band: 'cool',
    };
  }
  if (waterTempF >= 48) {
    return {
      wetsuit: '4/3mm or 5/4mm Hooded',
      thickness: '5/4',
      unit: 'mm hooded fullsuit',
      description:
        'Winter kit territory. An attached hood prevents the ice-cream headache on duck dives — worth every penny.',
      items: [
        { name: '5/4mm hooded fullsuit', required: true, note: 'Or 4/3 plus a separate hood' },
        { name: '5mm booties', required: true },
        { name: '3mm gloves', required: true },
      ],
      band: 'cold',
    };
  }
  if (waterTempF >= 40) {
    return {
      wetsuit: '6/5/4mm Hooded',
      thickness: '6/5',
      unit: 'mm hooded fullsuit',
      description:
        'Serious cold. Use a fresh, well-sealed suit — pinholes are the enemy. Tea after, dry clothes in the car, and somebody to notice if you take too long.',
      items: [
        { name: '6/5/4mm hooded fullsuit', required: true },
        { name: '7mm booties', required: true },
        { name: '5mm gloves or lobster mittens', required: true },
        { name: 'Thermos + dry change of clothes', required: false, note: 'For after' },
      ],
      warning: 'Limit sessions to 60–90 minutes. Hypothermia risk grows quickly past that.',
      band: 'very-cold',
    };
  }
  return {
    wetsuit: '6/5/4mm Hooded — extreme cold',
    thickness: '6/5',
    unit: 'mm hooded fullsuit',
    description:
      'Arctic conditions. Cold-shock risk on entry. Honestly, reconsider whether the session is worth it.',
    items: [
      { name: '6/5/4mm sealed hooded fullsuit', required: true },
      { name: '7mm booties', required: true },
      { name: '7mm lobster mittens', required: true },
    ],
    warning:
      'Below tolerance thresholds. Cold-shock risk on entry. Never paddle out alone — a friend on the beach is non-negotiable. Limit sessions to 30–45 minutes maximum.',
    band: 'arctic',
  };
}
