// Pure conversion math + helpers for the unit conversion network.
// Categories and units are loaded from /src/data/*.json by callers.
import categories from '~/data/categories.json';
import units from '~/data/units.json';

export type Category = (typeof categories)[number];
export type Unit = (typeof units)[number];

const unitBySlug: Record<string, Unit> = Object.fromEntries(units.map(u => [u.slug, u]));
const categoryBySlug: Record<string, Category> = Object.fromEntries(categories.map(c => [c.slug, c]));

export function getUnit(slug: string): Unit | undefined {
  return unitBySlug[slug];
}

export function getCategory(slug: string): Category | undefined {
  return categoryBySlug[slug];
}

export function getAllCategories(): Category[] {
  return categories;
}

export function getAllUnits(): Unit[] {
  return units;
}

export function getUnitsByCategory(catSlug: string): Unit[] {
  return units.filter(u => u.category === catSlug);
}

/** Find a unit by query — slug, name, symbol, or any alias. Returns the first match. */
export function findUnit(q: string): Unit | undefined {
  const ql = q.toLowerCase().trim();
  // slug exact
  if (unitBySlug[ql]) return unitBySlug[ql];
  // iter in declared order — first match wins (slug > name > alias)
  return units.find(u =>
    u.slug === ql ||
    u.name.toLowerCase() === ql ||
    u.symbol.toLowerCase() === ql ||
    (u.aliases || []).some(a => a.toLowerCase() === ql),
  );
}

/**
 * Convert a numeric value from one unit to another.
 *
 * Strategies:
 *   linear   → to_base = value × factor; from_base × factor
 *   affine   → to_base = value × slope + offset; ...
 *   reciprocal → fuel-economy (we store L/100 km as base; per-distance values invert through it)
 *
 * Returns null if units don't share a category or one of them is unknown.
 */
export function convert(value: number, fromSlug: string, toSlug: string): number | null {
  const from = getUnit(fromSlug);
  const to = getUnit(toSlug);
  if (!from || !to) return null;
  if (from.category !== to.category) return null;
  const cat = getCategory(from.category);
  if (!cat) return null;

  if (cat.kind === 'linear') {
    if (typeof from.factor !== 'number' || typeof to.factor !== 'number') return null;
    return (value * from.factor) / to.factor;
  }

  if (cat.kind === 'affine') {
    const fs = (from as any).slope, fo = (from as any).offset;
    const ts = (to as any).slope,   toOff = (to as any).offset;
    if (typeof fs !== 'number' || typeof fo !== 'number') return null;
    if (typeof ts !== 'number' || typeof toOff !== 'number') return null;
    const inBase = value * fs + fo;
    return (inBase - toOff) / ts;
  }

  if (cat.kind === 'reciprocal') {
    // Fuel-economy: split into two directions (distance-per-fuel vs fuel-per-distance).
    //   distance ↔ distance : linear, factor = ratio in km/L space
    //   fuel ↔ fuel         : linear, factor = ratio in L/100km space
    //   distance ↔ fuel     : reciprocal, value × result = K_from × K_to
    const fromDir = (from as any).direction as string | undefined;
    const toDir = (to as any).direction as string | undefined;
    if (fromDir && toDir && fromDir === toDir) {
      // linear within same direction
      const fFactor = (from as any).factor as number;
      const tFactor = (to as any).factor as number;
      if (typeof fFactor !== 'number' || typeof tFactor !== 'number') return null;
      return (value * fFactor) / tFactor;
    }
    // cross direction (or no direction info) — reciprocal
    const fK = (from as any).K as number | undefined;
    const tK = (to as any).K as number | undefined;
    if (typeof fK !== 'number' || typeof tK !== 'number') return null;
    return (fK * tK) / value;
  }

  return null;
}

/** Multiply the inverse (compute "1/x" of a unit's value cleanly — keeps numbers sane). */
export function convertSimple(value: number, fromSlug: string, toSlug: string): number | null {
  return convert(value, fromSlug, toSlug);
}

/** Smart number formatter: trim trailing zeros, keep up to `precision` digits, locale commas. */
export function formatNumber(n: number | null | undefined, precision = 6): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e12 || abs < 1e-4) {
    // scientific for extremes
    return n.toExponential(Math.max(0, precision - 2));
  }
  // round to precision, then strip trailing zeros
  const factor = Math.pow(10, precision);
  const rounded = Math.round(n * factor) / factor;
  let s = rounded.toLocaleString('en-US', {
    maximumFractionDigits: precision,
  });
  return s;
}

/**
 * Build a flat list of "promoted" pairs to generate as static pages.
 * We pick every unit × every OTHER unit in its category, but cap the longest categories
 * to top N (popular units first) so the build doesn't explode.
 *
 * Popular unit order is implicit (declared order of units.json — first ones get promoted first).
 */
const PAIR_PROMOTION_CAP: Record<string, number> = {
  length: 12,
  mass: 10,
  temperature: 5,   // all 5 — they all pair interestingly
  area: 11,         // 11 area units incl. tsubo/jo — promote all so unit-page links resolve
  volume: 14,
  speed: 6,
  time: 12,
  data: 12,
  energy: 10,
  pressure: 8,
  angle: 6,
  'fuel-economy': 4,
};

export interface Pair {
  from: string;
  to: string;
  /** URL slug like "meter-to-feet" */
  url: string;
}

/**
 * Pair URLs that are superseded by hand-written, per-locale landing pages
 * (src/pages/[locale]/<url>.astro). The generic [from]-to-[to] template skips
 * these (locale, url) combos so two routes never build the same path.
 */
export const PAIR_PAGE_OVERRIDES: Record<string, string[]> = {
  'jo-to-square-meter': ['ja'],
};

/** Pick a "primary" set of N units for each category. First listed = highest priority. */
function pickPromoted(catSlug: string): Unit[] {
  const cat = getCategory(catSlug);
  if (!cat) return [];
  const cap = PAIR_PROMOTION_CAP[catSlug] ?? 999;
  return getUnitsByCategory(catSlug).slice(0, cap);
}

/** All-generated pairs for all categories (returns {from, to, url}). */
export function getAllPairs(): Pair[] {
  const pairs: Pair[] = [];
  for (const cat of categories) {
    const promoted = pickPromoted(cat.slug);
    for (let i = 0; i < promoted.length; i++) {
      for (let j = 0; j < promoted.length; j++) {
        if (i === j) continue;
        const a = promoted[i], b = promoted[j];
        pairs.push({ from: a.slug, to: b.slug, url: `${a.slug}-to-${b.slug}` });
      }
    }
  }
  return pairs;
}

/** Top-N pairs across categories — for top-level showcase / popular conversions list. */
export function getPopularPairs(): Pair[] {
  // Heuristic: 5 cross-category popular queries, hardcoded because they're the
  // ones everyone searches for. Expand by adding entries here.
  const popularPairs: Array<[string, string]> = [
    // length
    ['meter', 'foot'], ['foot', 'meter'], ['kilometer', 'mile'], ['mile', 'kilometer'],
    ['inch', 'centimeter'], ['centimeter', 'inch'], ['mile', 'foot'], ['yard', 'meter'],
    ['meter', 'kilometer'], ['kilometer', 'meter'], ['meter', 'centimeter'], ['meter', 'millimeter'],
    ['foot', 'inch'], ['inch', 'foot'], ['meter', 'yard'], ['yard', 'foot'],
    ['light-year', 'meter'], ['nautical-mile', 'kilometer'],
    // mass
    ['kilogram', 'pound'], ['pound', 'kilogram'], ['gram', 'ounce'], ['ounce', 'gram'],
    ['kilogram', 'gram'], ['gram', 'kilogram'], ['pound', 'ounce'], ['ounce', 'pound'],
    ['stone', 'kilogram'], ['kilogram', 'stone'], ['carat', 'gram'], ['pound', 'stone'],
    ['metric-ton', 'kilogram'], ['kilogram', 'metric-ton'], ['milligram', 'gram'], ['gram', 'milligram'],
    // temperature
    ['celsius', 'fahrenheit'], ['fahrenheit', 'celsius'], ['celsius', 'kelvin'], ['kelvin', 'celsius'],
    ['fahrenheit', 'kelvin'], ['kelvin', 'fahrenheit'], ['rankine', 'celsius'], ['reaumur', 'celsius'],
    // area
    ['square-meter', 'square-foot'], ['square-foot', 'square-meter'], ['hectare', 'acre'], ['acre', 'hectare'],
    ['square-meter', 'hectare'], ['square-kilometer', 'square-mile'], ['square-mile', 'square-kilometer'],
    ['square-meter', 'acre'], ['square-mile', 'acre'], ['square-yard', 'square-foot'],
    // volume
    ['liter', 'gallon-us'], ['gallon-us', 'liter'], ['liter', 'milliliter'], ['milliliter', 'liter'],
    ['cup-us', 'milliliter'], ['milliliter', 'cup-us'], ['tablespoon-us', 'milliliter'],
    ['teaspoon-us', 'milliliter'], ['quart-us', 'liter'], ['pint-us', 'liter'],
    ['gallon-us', 'gallon-uk'], ['gallon-uk', 'gallon-us'], ['cubic-foot', 'liter'],
    ['cubic-inch', 'milliliter'], ['gallon-us', 'barrel-petroleum'],
    // speed
    ['kilometer-per-hour', 'mile-per-hour'], ['mile-per-hour', 'kilometer-per-hour'],
    ['meter-per-second', 'kilometer-per-hour'], ['kilometer-per-hour', 'meter-per-second'],
    ['knot', 'mile-per-hour'], ['mile-per-hour', 'knot'], ['mach', 'kilometer-per-hour'],
    ['knot', 'kilometer-per-hour'], ['foot-per-second', 'meter-per-second'], ['mile-per-hour', 'foot-per-second'],
    // time
    ['hour', 'minute'], ['minute', 'hour'], ['second', 'minute'], ['minute', 'second'],
    ['day', 'hour'], ['hour', 'day'], ['week', 'day'], ['day', 'week'],
    ['hour', 'second'], ['second', 'hour'], ['millisecond', 'second'], ['second', 'millisecond'],
    ['year', 'day'], ['day', 'year'], ['week', 'hour'], ['decade', 'year'], ['century', 'year'],
    // data
    ['byte', 'kilobyte'], ['kilobyte', 'byte'], ['byte', 'kibibyte'], ['kibibyte', 'byte'],
    ['megabyte', 'kilobyte'], ['gigabyte', 'megabyte'], ['terabyte', 'gigabyte'],
    ['kilobyte', 'kibibyte'], ['kibibyte', 'kilobyte'], ['megabyte', 'mebibyte'],
    ['gigabyte', 'gibibyte'], ['terabyte', 'tebibyte'], ['petabyte', 'terabyte'],
    ['bit', 'byte'], ['kilobyte', 'bit'], ['megabyte', 'gigabyte'], ['gigabyte', 'terabyte'],
    ['kbps', 'byte'], ['byte', 'kbps'],
    // energy
    ['joule', 'calorie'], ['calorie', 'joule'], ['kilocalorie', 'kilojoule'], ['kilojoule', 'kilocalorie'],
    ['kilowatt-hour', 'joule'], ['joule', 'kilowatt-hour'], ['btu', 'joule'], ['joule', 'btu'],
    ['kilowatt-hour', 'btu'], ['btu', 'kilowatt-hour'], ['kilocalorie', 'joule'], ['calorie', 'kilocalorie'],
    ['watt-hour', 'joule'], ['kilowatt-hour', 'kilocalorie'], ['therm', 'kilowatt-hour'],
    // pressure
    ['pascal', 'bar'], ['bar', 'pascal'], ['psi', 'bar'], ['bar', 'psi'],
    ['pascal', 'psi'], ['psi', 'pascal'], ['kilopascal', 'psi'], ['psi', 'kilopascal'],
    ['atmosphere', 'pascal'], ['pascal', 'atmosphere'], ['torr', 'pascal'], ['pascal', 'torr'],
    ['mmhg', 'kilopascal'], ['kilopascal', 'mmhg'], ['millibar', 'pascal'], ['bar', 'atmosphere'],
    // angle
    ['degree', 'radian'], ['radian', 'degree'], ['degree', 'gradian'], ['gradian', 'degree'],
    ['minute-of-arc', 'degree'], ['degree', 'minute-of-arc'], ['radian', 'turn'], ['degree', 'turn'],
    ['second-of-arc', 'degree'], ['degree', 'second-of-arc'], ['gradian', 'radian'],
    // fuel-economy
    ['mpg-us', 'liter-per-100km'], ['liter-per-100km', 'mpg-us'],
    ['mpg-uk', 'liter-per-100km'], ['liter-per-100km', 'mpg-uk'],
    ['km-per-liter', 'liter-per-100km'], ['liter-per-100km', 'km-per-liter'],
  ];
  const seen = new Set<string>();
  return popularPairs
    .filter(([a, b]) => !!getUnit(a) && !!getUnit(b) && a !== b)
    .filter(([a, b]) => {
      const k = `${a}>${b}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .map(([from, to]) => ({ from, to, url: `${from}-to-${to}` }));
}

/** A unit-page's "related units" — same category, top-of-list siblings first. */
export function getRelatedUnits(slug: string, limit = 8): Unit[] {
  const u = getUnit(slug);
  if (!u) return [];
  return getUnitsByCategory(u.category).filter(x => x.slug !== slug).slice(0, limit);
}

/** A unit-page's "common pairs" (unit × top-N siblings in its category). */
export function getUnitPairs(slug: string, limit = 8): Pair[] {
  const u = getUnit(slug);
  if (!u) return [];
  const siblings = getUnitsByCategory(u.category).filter(x => x.slug !== slug).slice(0, limit);
  return [
    ...siblings.map(s => ({ from: slug, to: s.slug, url: `${slug}-to-${s.slug}` })),
    ...siblings.slice(0, Math.max(2, limit - 4)).map(s => ({ from: s.slug, to: slug, url: `${s.slug}-to-${slug}` })),
  ];
}

/** Lookup helper for category display metadata. */
export function describeCategory(slug: string): string {
  return getCategory(slug)?.description ?? '';
}
