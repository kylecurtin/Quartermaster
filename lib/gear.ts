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
}

export function recommendGear(
  waterTempF: number | null,
  airTempF: number,
  windMph: number,
): Recommendation | null {
  if (waterTempF == null || Number.isNaN(waterTempF)) return null;

  let r: Recommendation;

  if (waterTempF >= 75) {
    r = {
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
  } else if (waterTempF >= 70) {
    r = {
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
  } else if (waterTempF >= 65) {
    r = {
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
  } else if (waterTempF >= 60) {
    r = {
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
  } else if (waterTempF >= 55) {
    r = {
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
  } else if (waterTempF >= 48) {
    r = {
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
  } else if (waterTempF >= 40) {
    r = {
      wetsuit: '6/5/4mm Hooded',
      thickness: '6/5',
      unit: 'mm hooded fullsuit',
      description:
        'Serious cold. Use a fresh, well-sealed suit — pinholes are the enemy, tea is your friend, and changing in the car is a sacrament.',
      items: [
        { name: '6/5/4mm hooded fullsuit', required: true },
        { name: '7mm booties', required: true },
        { name: '5mm gloves or lobster mittens', required: true },
        { name: 'Thermos + dry change of clothes', required: false, note: 'For after' },
      ],
      warning: 'Limit sessions to 60–90 minutes. Hypothermia risk grows quickly past that.',
      band: 'very-cold',
    };
  } else {
    r = {
      wetsuit: '6/5/4mm Hooded — extreme cold',
      thickness: '6/5',
      unit: 'mm hooded fullsuit',
      description:
        'Arctic conditions. Cold-shock risk on entry. Honestly, reconsider whether the session is worth it — and never paddle out alone.',
      items: [
        { name: '6/5/4mm sealed hooded fullsuit', required: true },
        { name: '7mm booties', required: true },
        { name: '7mm lobster mittens', required: true },
        {
          name: 'A buddy on the beach',
          required: true,
          note: 'Non-negotiable in freezing water',
        },
      ],
      warning:
        'Below tolerance thresholds. Cold-shock risk on entry. Limit sessions to 30–45 minutes maximum.',
      band: 'arctic',
    };
  }

  // Wind-chill consideration: add a hood suggestion when it's windy and the air bites
  if (windMph > 18 && airTempF < 55 && waterTempF >= 55) {
    if (!r.items.some((i) => i.name.toLowerCase().includes('hood'))) {
      r.items.push({
        name: 'Neoprene hood',
        required: false,
        note: `Wind ${Math.round(windMph)} mph + cool air — your ears will thank you`,
      });
    }
  }

  return r;
}
