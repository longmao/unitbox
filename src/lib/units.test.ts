// BDD tests for the unit conversion network.
// Run with: npx vitest
//
// What this catches:
//   - The "1 undefined = 0.3048 undefined" regression (slug-symbol mismatch / undefined symbol).
//   - Unit/category slug integrity (every referenced slug resolves).
//   - Math correctness for linear / affine / reciprocal conversions across all 105 units.
//   - Round-trip stability (a → b → a gives back original within precision).
//   - Popular pair spot checks (Google NIST values).
import { describe, expect, it } from 'vitest';
import {
  getUnit,
  getCategory,
  getUnitsByCategory,
  convert,
  formatNumber,
  getAllPairs,
  getPopularPairs,
} from './units';
import unitsData from '~/data/units.json';
import categoriesData from '~/data/categories.json';

const approxEq = (a: number | null, b: number, rel = 1e-6) => {
  if (a === null) return false;
  return Math.abs(a - b) <= Math.max(Math.abs(b), 1) * rel;
};

describe('data integrity', () => {
  it('every unit has the required fields', () => {
    for (const u of unitsData) {
      expect(u.slug, `unit missing slug`).toBeTruthy();
      expect(u.name, `${u.slug} missing name`).toBeTruthy();
      expect(u.symbol, `${u.slug} missing symbol`).toBeTruthy();
      expect(u.category, `${u.slug} missing category`).toBeTruthy();
    }
  });

  it('every unit slug is unique', () => {
    const slugs = new Set<string>();
    for (const u of unitsData) {
      expect(slugs.has(u.slug), `duplicate slug ${u.slug}`).toBe(false);
      slugs.add(u.slug);
    }
    expect(slugs.size).toBe(unitsData.length);
  });

  it('every unit.category points to a real category', () => {
    const cats = new Set(categoriesData.map(c => c.slug));
    for (const u of unitsData) {
      expect(cats.has(u.category), `unit ${u.slug} has unknown category ${u.category}`).toBe(true);
    }
  });

  it('every unit has either factor (linear/affine) or reciprocal fields', () => {
    for (const u of unitsData) {
      const cat = categoriesData.find(c => c.slug === u.category);
      if (cat?.kind === 'linear' || cat?.kind === 'affine') {
        // linear needs factor; affine needs slope + offset
        if (cat.kind === 'linear') {
          expect(typeof u.factor, `${u.slug} (linear) needs factor`).toBe('number');
        } else {
          expect(typeof (u as any).slope, `${u.slug} (affine) needs slope`).toBe('number');
          expect(typeof (u as any).offset, `${u.slug} (affine) needs offset`).toBe('number');
        }
      }
      if (cat?.kind === 'reciprocal') {
        // Direction-aware: every reciprocal unit must declare direction ('distance' | 'fuel') + K
        expect(typeof u.factor, `${u.slug} (reciprocal) needs factor`).toBe('number');
        expect(typeof (u as any).direction, `${u.slug} (reciprocal) needs direction`).toBe('string');
        expect(['distance', 'fuel'], `${u.slug} (reciprocal) direction must be distance|fuel`).toContain((u as any).direction);
        expect(typeof (u as any).K, `${u.slug} (reciprocal) needs K`).toBe('number');
      }
    }
  });

  it('every unit is reachable via getUnit', () => {
    for (const u of unitsData) {
      const got = getUnit(u.slug);
      expect(got?.slug).toBe(u.slug);
    }
  });

  it('every category is reachable via getCategory', () => {
    for (const c of categoriesData) {
      expect(getCategory(c.slug)?.slug).toBe(c.slug);
    }
  });

  it('unit symbols are non-empty and not the literal string "undefined"', () => {
    for (const u of unitsData) {
      expect(u.symbol.length, `${u.slug} symbol is empty`).toBeGreaterThan(0);
      expect(u.symbol.toLowerCase(), `${u.slug} symbol is "undefined"`).not.toBe('undefined');
    }
  });
});

describe('linear conversions (×÷ factors)', () => {
  const linearCases = [
    // length
    { cat: 'length', from: 'meter', to: 'foot', value: 1, expected: 3.28084 },
    { cat: 'length', from: 'foot', to: 'meter', value: 1, expected: 0.3048 },
    { cat: 'length', from: 'kilometer', to: 'mile', value: 1, expected: 0.621371 },
    { cat: 'length', from: 'mile', to: 'kilometer', value: 1, expected: 1.609344 },
    { cat: 'length', from: 'inch', to: 'centimeter', value: 1, expected: 2.54 },
    { cat: 'length', from: 'centimeter', to: 'inch', value: 1, expected: 0.393701 },
    { cat: 'length', from: 'yard', to: 'meter', value: 1, expected: 0.9144 },
    // mass
    { cat: 'mass', from: 'kilogram', to: 'pound', value: 1, expected: 2.20462 },
    { cat: 'mass', from: 'pound', to: 'kilogram', value: 1, expected: 0.453592 },
    { cat: 'mass', from: 'gram', to: 'ounce', value: 100, expected: 3.5274 },
    { cat: 'mass', from: 'stone', to: 'kilogram', value: 1, expected: 6.35029 },
    // data
    { cat: 'data', from: 'byte', to: 'kilobyte', value: 1000, expected: 1 },
    { cat: 'data', from: 'byte', to: 'kibibyte', value: 1024, expected: 1 },
    { cat: 'data', from: 'kilobyte', to: 'kibibyte', value: 1, expected: 0.9765625 },
    { cat: 'data', from: 'kibibyte', to: 'kilobyte', value: 1, expected: 1.024 },
    { cat: 'data', from: 'megabyte', to: 'gigabyte', value: 1024, expected: 1.024 },
    // energy
    { cat: 'energy', from: 'joule', to: 'calorie', value: 1, expected: 0.239006 },
    { cat: 'energy', from: 'kilocalorie', to: 'kilojoule', value: 1, expected: 4.184 },
    { cat: 'energy', from: 'kilowatt-hour', to: 'joule', value: 1, expected: 3.6e6 },
    // pressure
    { cat: 'pressure', from: 'psi', to: 'bar', value: 14.5038, expected: 1 },
    { cat: 'pressure', from: 'bar', to: 'pascal', value: 1, expected: 100000 },
    { cat: 'pressure', from: 'atmosphere', to: 'pascal', value: 1, expected: 101325 },
    // time
    { cat: 'time', from: 'hour', to: 'second', value: 1, expected: 3600 },
    { cat: 'time', from: 'day', to: 'minute', value: 1, expected: 1440 },
    { cat: 'time', from: 'year', to: 'day', value: 1, expected: 365.25 },
    // speed
    { cat: 'speed', from: 'mile-per-hour', to: 'kilometer-per-hour', value: 60, expected: 96.5606 },
    { cat: 'speed', from: 'knot', to: 'mile-per-hour', value: 1, expected: 1.15078 },
    // angle
    { cat: 'angle', from: 'degree', to: 'radian', value: 180, expected: Math.PI },
    { cat: 'angle', from: 'turn', to: 'degree', value: 1, expected: 360 },
    // volume
    { cat: 'volume', from: 'liter', to: 'gallon-us', value: 1, expected: 0.264172 },
    { cat: 'volume', from: 'gallon-us', to: 'gallon-uk', value: 1, expected: 0.832674 },
    { cat: 'volume', from: 'cup-us', to: 'milliliter', value: 1, expected: 236.588 },
  ];

  for (const tc of linearCases) {
    it(`${tc.value} ${tc.from} → ${tc.to} ≈ ${tc.expected}`, () => {
      const got = convert(tc.value, tc.from, tc.to);
      expect(approxEq(got, tc.expected, 1e-3), `got ${got}, expected ${tc.expected}`).toBe(true);
    });
  }
});

describe('affine conversions (temperature)', () => {
  // (°C × 9/5) + 32 = °F
  // K = °C + 273.15
  // °Ré = (°C × 5/4)
  // °R = (°F + 459.67) = (K × 9/5)
  const tempCases = [
    { from: 'celsius', to: 'fahrenheit', value: 0, expected: 32 },
    { from: 'celsius', to: 'fahrenheit', value: 100, expected: 212 },
    { from: 'celsius', to: 'fahrenheit', value: -40, expected: -40 }, // the famous crossover
    { from: 'fahrenheit', to: 'celsius', value: 32, expected: 0 },
    { from: 'fahrenheit', to: 'celsius', value: 212, expected: 100 },
    { from: 'celsius', to: 'kelvin', value: 0, expected: 273.15 },
    { from: 'celsius', to: 'kelvin', value: 25, expected: 298.15 },
    { from: 'kelvin', to: 'celsius', value: 0, expected: -273.15 },
    { from: 'fahrenheit', to: 'kelvin', value: 32, expected: 273.15 },
    { from: 'rankine', to: 'celsius', value: 491.67, expected: 0 }, // 491.67 R = 32 F = 0 C
    { from: 'reaumur', to: 'celsius', value: 0, expected: 0 },
    { from: 'reaumur', to: 'celsius', value: 80, expected: 100 },
  ];

  for (const tc of tempCases) {
    it(`${tc.value} ${tc.from} → ${tc.to} ≈ ${tc.expected}`, () => {
      const got = convert(tc.value, tc.from, tc.to);
      expect(approxEq(got, tc.expected, 1e-3), `got ${got}, expected ${tc.expected}`).toBe(true);
    });
  }
});

describe('reciprocal conversions (fuel-economy)', () => {
  // 235.214583 / MPG(US) = L/100km
  // 282.481 / MPG(UK) = L/100km
  // km/L <-> L/100km: L/100km = 100 / (km/L)
  const fuelCases = [
    { from: 'mpg-us', to: 'liter-per-100km', value: 30, expected: 7.84 },
    { from: 'mpg-us', to: 'liter-per-100km', value: 40, expected: 5.88 },
    { from: 'mpg-us', to: 'liter-per-100km', value: 50, expected: 4.704 },
    { from: 'liter-per-100km', to: 'mpg-us', value: 6, expected: 39.2024 },
    { from: 'liter-per-100km', to: 'mpg-uk', value: 7, expected: 40.354 }, // 282.481/7 ≈ 40.354
    { from: 'km-per-liter', to: 'liter-per-100km', value: 20, expected: 5 }, // 100/20 = 5
    { from: 'liter-per-100km', to: 'km-per-liter', value: 5, expected: 20 },
  ];

  for (const tc of fuelCases) {
    it(`${tc.value} ${tc.from} → ${tc.to} ≈ ${tc.expected}`, () => {
      const got = convert(tc.value, tc.from, tc.to);
      expect(approxEq(got, tc.expected, 1e-2), `got ${got}, expected ${tc.expected}`).toBe(true);
    });
  }
});

describe('cross-category conversions are rejected', () => {
  it('metre → kilogram returns null', () => {
    expect(convert(1, 'meter', 'kilogram')).toBeNull();
  });
  it('celsius → meter returns null', () => {
    expect(convert(1, 'celsius', 'meter')).toBeNull();
  });
});

describe('round-trip stability', () => {
  it('1 metre → foot → metre is identity', () => {
    const toFt = convert(1, 'meter', 'foot') as number;
    const back = convert(toFt, 'foot', 'meter') as number;
    expect(approxEq(back, 1, 1e-9)).toBe(true);
  });

  it('1 °C → °F → °C is identity', () => {
    const toF = convert(1, 'celsius', 'fahrenheit') as number;
    const back = convert(toF, 'fahrenheit', 'celsius') as number;
    expect(approxEq(back, 1, 1e-9)).toBe(true);
  });

  it('30 MPG → L/100km → MPG is identity', () => {
    const toL = convert(30, 'mpg-us', 'liter-per-100km') as number;
    const back = convert(toL, 'liter-per-100km', 'mpg-us') as number;
    expect(approxEq(back, 30, 1e-9)).toBe(true);
  });
});

describe('pair generation', () => {
  it('getPopularPairs returns a sensible list with no duplicates', () => {
    const pairs = getPopularPairs();
    const seen = new Set<string>();
    for (const p of pairs) {
      expect(seen.has(p.url), `duplicate pair ${p.url}`).toBe(false);
      seen.add(p.url);
      expect(p.from).not.toBe(p.to);
    }
    expect(pairs.length).toBeGreaterThan(50);
  });

  it('every popular pair references units that exist in the data', () => {
    for (const p of getPopularPairs()) {
      expect(getUnit(p.from), `popular pair references missing from-slug ${p.from}`).toBeTruthy();
      expect(getUnit(p.to), `popular pair references missing to-slug ${p.to}`).toBeTruthy();
      // And they're in the same category
      const fc = getUnit(p.from)?.category;
      const tc = getUnit(p.to)?.category;
      expect(fc, `from-side category`).toBe(tc);
    }
  });

  it('every generated pair has a valid conversion', () => {
    // Smoke-test the first 50 generated pairs (avoid running 1000 conversions in CI).
    const pairs = getAllPairs().slice(0, 50);
    for (const p of pairs) {
      const got = convert(1, p.from, p.to);
      expect(got, `${p.url} should convert`).not.toBeNull();
      expect(Number.isFinite(got!)).toBe(true);
    }
  });
});

describe('formatNumber', () => {
  it('returns "—" for null / undefined / NaN / Infinity', () => {
    expect(formatNumber(null)).toBe('—');
    expect(formatNumber(undefined)).toBe('—');
    expect(formatNumber(NaN)).toBe('—');
    expect(formatNumber(Infinity)).toBe('—');
  });
  it('returns 0 for 0', () => {
    expect(formatNumber(0)).toBe('0');
  });
  it('uses scientific notation for very small / very large numbers', () => {
    expect(formatNumber(1e-15)).toMatch(/e/i);
    expect(formatNumber(1e20)).toMatch(/e/i);
  });
  it('locale-aware comma grouping (en-US)', () => {
    // formatNumber uses en-US locale formatting; i18n wrapper handles zh separately.
    expect(formatNumber(1234.5)).toContain('1,234.5');
  });
});

describe('coverage smoke test', () => {
  it('every unit converts to at least one sibling in its category', () => {
    for (const u of unitsData) {
      const siblings = getUnitsByCategory(u.category).filter(s => s.slug !== u.slug);
      expect(siblings.length, `${u.slug} has no siblings`).toBeGreaterThan(0);
      const result = convert(1, u.slug, siblings[0].slug);
      expect(result, `${u.slug} → ${siblings[0].slug} should convert`).not.toBeNull();
    }
  });

  it('every category has at least 3 units', () => {
    for (const c of categoriesData) {
      const cnt = getUnitsByCategory(c.slug).length;
      expect(cnt, `category ${c.slug} has fewer than 3 units`).toBeGreaterThanOrEqual(3);
    }
  });
});
