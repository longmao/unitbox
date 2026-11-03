import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

const DIST = path.join(process.cwd(), 'dist', 'en', 'scenarios');

describe('work-scenario pages', () => {
  const scenarios = [
    ['data-storage-converter', 'gigabyte', 'gibibyte'],
    ['fuel-economy-converter', 'mpg-us', 'liter-per-100km'],
    ['construction-unit-converter', 'millimeter', 'inch'],
  ] as const;

  for (const [slug, from, to] of scenarios) {
    it(`${slug} has an interactive conversion and working guidance`, () => {
      const html = fs.readFileSync(path.join(DIST, slug, 'index.html'), 'utf8');
      expect(html).toContain('scenario-instrument');
      expect(html).toContain(`data-from="${from}"`);
      expect(html).toContain(`data-to="${to}"`);
      expect(html).toContain('Use the result in context.');
      expect(html).toContain('Open the full calculator');
    });
  }
});
