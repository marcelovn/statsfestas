import { PriceReference } from '../models/budget.models';

const categories = [
  'Salao',
  'Buffet',
  'Decoracao',
  'Bolo',
  'Lembrancinhas',
  'DJ/Animacao',
  'Foto/Video',
  'Extras'
] as const;

function baseForEvent(eventType: PriceReference['eventType']): PriceReference[] {
  const eventFactor = eventType === 'Infantil' ? 1 : eventType === '15 anos' ? 1.18 : 1.45;

  return [
    {
      eventType,
      city: 'RJ Geral',
      category: categories[0],
      calcType: 'tiered',
      min: 0,
      med: 0,
      max: 0,
      tiers: [
        { guestMin: 0, guestMax: 60, min: 1800 * eventFactor, med: 2600 * eventFactor, max: 3600 * eventFactor },
        { guestMin: 61, guestMax: 120, min: 2800 * eventFactor, med: 3900 * eventFactor, max: 5600 * eventFactor },
        { guestMin: 121, guestMax: 300, min: 4200 * eventFactor, med: 6200 * eventFactor, max: 9800 * eventFactor }
      ],
      sampleSize: 18,
      reliability: 'media',
      sourceLabel: 'Curadoria publica RJ 2025-2026'
    },
    {
      eventType,
      city: 'RJ Geral',
      category: categories[1],
      calcType: 'perPerson',
      min: 38 * eventFactor,
      med: 62 * eventFactor,
      max: 98 * eventFactor,
      sampleSize: 34,
      reliability: 'alta',
      sourceLabel: 'Curadoria publica RJ 2025-2026'
    },
    {
      eventType,
      city: 'RJ Geral',
      category: categories[2],
      calcType: 'tiered',
      min: 0,
      med: 0,
      max: 0,
      tiers: [
        { guestMin: 0, guestMax: 60, min: 900 * eventFactor, med: 1800 * eventFactor, max: 3500 * eventFactor },
        { guestMin: 61, guestMax: 120, min: 1600 * eventFactor, med: 2800 * eventFactor, max: 5200 * eventFactor },
        { guestMin: 121, guestMax: 300, min: 2600 * eventFactor, med: 4500 * eventFactor, max: 8200 * eventFactor }
      ],
      sampleSize: 20,
      reliability: 'media',
      sourceLabel: 'Curadoria publica RJ 2025-2026'
    },
    {
      eventType,
      city: 'RJ Geral',
      category: categories[3],
      calcType: 'fixed',
      min: 380 * eventFactor,
      med: 760 * eventFactor,
      max: 1600 * eventFactor,
      sampleSize: 15,
      reliability: 'media',
      sourceLabel: 'Curadoria publica RJ 2025-2026'
    },
    {
      eventType,
      city: 'RJ Geral',
      category: categories[4],
      calcType: 'perPerson',
      min: 6 * eventFactor,
      med: 12 * eventFactor,
      max: 22 * eventFactor,
      sampleSize: 14,
      reliability: 'baixa',
      sourceLabel: 'Curadoria publica RJ 2025-2026'
    },
    {
      eventType,
      city: 'RJ Geral',
      category: categories[5],
      calcType: 'fixed',
      min: 700 * eventFactor,
      med: 1400 * eventFactor,
      max: 3200 * eventFactor,
      sampleSize: 11,
      reliability: 'media',
      sourceLabel: 'Curadoria publica RJ 2025-2026'
    },
    {
      eventType,
      city: 'RJ Geral',
      category: categories[6],
      calcType: 'fixed',
      min: 850 * eventFactor,
      med: 1900 * eventFactor,
      max: 4800 * eventFactor,
      sampleSize: 10,
      reliability: 'baixa',
      sourceLabel: 'Curadoria publica RJ 2025-2026'
    },
    {
      eventType,
      city: 'RJ Geral',
      category: categories[7],
      calcType: 'fixed',
      min: 450 * eventFactor,
      med: 1200 * eventFactor,
      max: 2600 * eventFactor,
      sampleSize: 10,
      reliability: 'baixa',
      sourceLabel: 'Curadoria publica RJ 2025-2026'
    }
  ];
}

function withCityAdjustment(base: PriceReference[], city: string, factor: number): PriceReference[] {
  return base.map((item) => ({
    ...item,
    city,
    min: item.min * factor,
    med: item.med * factor,
    max: item.max * factor,
    tiers: item.tiers?.map((tier) => ({
      ...tier,
      min: tier.min * factor,
      med: tier.med * factor,
      max: tier.max * factor
    }))
  }));
}

const allEvents: PriceReference['eventType'][] = ['Infantil', '15 anos', 'Casamento'];

const baseData = allEvents.flatMap((eventType) => baseForEvent(eventType));

export const PRICE_REFERENCES: PriceReference[] = [
  ...baseData,
  ...allEvents.flatMap((eventType) => withCityAdjustment(baseForEvent(eventType), 'Rio de Janeiro', 1.2)),
  ...allEvents.flatMap((eventType) => withCityAdjustment(baseForEvent(eventType), 'Niteroi', 1.05)),
  ...allEvents.flatMap((eventType) => withCityAdjustment(baseForEvent(eventType), 'Sao Goncalo', 0.93)),
  ...allEvents.flatMap((eventType) => withCityAdjustment(baseForEvent(eventType), 'Marica', 0.98)),
  ...allEvents.flatMap((eventType) => withCityAdjustment(baseForEvent(eventType), 'Itaborai', 0.9))
];
