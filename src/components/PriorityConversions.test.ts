import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { priorityConversionCount } from '~/data/priority-conversions';

const dist = path.resolve(process.cwd(), 'dist', 'en');
const priorityPages = [
  'meter-to-foot', 'foot-to-meter', 'kilometer-to-mile', 'mile-to-kilometer', 'inch-to-centimeter',
  'centimeter-to-inch', 'kilogram-to-pound', 'pound-to-kilogram', 'celsius-to-fahrenheit',
  'fahrenheit-to-celsius', 'liter-to-gallon-us', 'gallon-us-to-liter', 'square-meter-to-square-foot',
  'square-foot-to-square-meter', 'kilobyte-to-kibibyte', 'gigabyte-to-gibibyte',
  'mpg-us-to-liter-per-100km', 'liter-per-100km-to-mpg-us', 'psi-to-bar', 'bar-to-psi',
];

describe('priority conversion pages', () => {
  it('keeps an editorial guide on every promoted conversion', () => {
    expect(priorityConversionCount).toBe(priorityPages.length);
    for (const slug of priorityPages) {
      const html = fs.readFileSync(path.join(dist, slug, 'index.html'), 'utf8');
      expect(html, `${slug} should have contextual guidance`).toContain('priority-guide');
      expect(html, `${slug} should link to a reference`).toContain('guide-links');
    }
  });

  it('does not place an ad directly under the calculator result', () => {
    const html = fs.readFileSync(path.join(dist, 'meter-to-foot', 'index.html'), 'utf8');
    expect(html).toContain('priority-guide');
    expect(html).not.toContain('ad-slot-after-result');
  });
});
