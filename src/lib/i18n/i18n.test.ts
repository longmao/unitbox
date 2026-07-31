// BDD for src/lib/i18n. Verifies the three locale dicts stay aligned and the
// helpers (t / tFmt / formatNumber / formatDate) behave correctly.

import { describe, it, expect } from 'vitest';
import { LOCALES, DEFAULT_LOCALE, t, tFmt, formatNumber, formatDate, isLocale, OG_LOCALE, IN_LANGUAGE } from './index';
import { EN } from './en';
import { ZH_HANT } from './zh-hant';
import { ZH_HANS } from './zh-hans';

describe('i18n locale registry', () => {
  it('declares exactly three locales', () => {
    expect(LOCALES).toEqual(['en', 'zh-hant', 'zh-hans']);
  });

  it('defaults to English', () => {
    expect(DEFAULT_LOCALE).toBe('en');
  });

  it('every locale has an OG tag', () => {
    for (const l of LOCALES) {
      expect(OG_LOCALE[l]).toMatch(/^[a-z]{2}_[A-Z][a-zA-Z]+$/);
    }
  });

  it('every locale has an inLanguage value', () => {
    for (const l of LOCALES) {
      expect(IN_LANGUAGE[l]).toBeTruthy();
    }
  });

  it('isLocale() accepts only registered locales', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('zh-hant')).toBe(true);
    expect(isLocale('zh-hans')).toBe(true);
    expect(isLocale('zh')).toBe(false); // legacy alias no longer valid
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});

describe('i18n dict consistency', () => {
  it('en, zh-hant, zh-hans have identical key sets', () => {
    const enKeys = Object.keys(EN).sort();
    const hantKeys = Object.keys(ZH_HANT).sort();
    const hansKeys = Object.keys(ZH_HANS).sort();
    expect(hantKeys).toEqual(enKeys);
    expect(hansKeys).toEqual(enKeys);
  });

  it('no key has an empty value in any locale', () => {
    for (const l of LOCALES) {
      const dict = l === 'en' ? EN : l === 'zh-hant' ? ZH_HANT : ZH_HANS;
      for (const [k, v] of Object.entries(dict)) {
        expect(v, `${l}.${k} must be non-empty`).toBeTruthy();
      }
    }
  });

  it('has at least 50 keys (sanity for a real product)', () => {
    expect(Object.keys(EN).length).toBeGreaterThan(50);
  });
});

describe('t() / tFmt()', () => {
  it('returns the locale string', () => {
    expect(t('nav.home', 'en')).toBe('Home');
    expect(t('nav.home', 'zh-hant')).toBe('首頁');
    expect(t('nav.home', 'zh-hans')).toBe('首页');
  });

  it('falls back to English for unknown locale', () => {
    // @ts-expect-error - intentionally bad
    expect(t('nav.home', 'fr-FR')).toBe('Home');
  });

  it('tFmt() interpolates {placeholders}', () => {
    expect(tFmt('pair.about-from', 'en', { unit: 'meter' })).toBe('About the meter');
    expect(tFmt('pair.about-from', 'zh-hans', { unit: '米' })).toBe('关于米');
    expect(tFmt('pair.about-from', 'zh-hant', { unit: '公尺' })).toBe('關於公尺');
  });

  it('returns the key if the key is missing', () => {
    expect(t('nonexistent.key', 'en')).toBe('nonexistent.key');
  });
});

describe('formatNumber()', () => {
  it('returns dash for null/undefined/non-finite', () => {
    expect(formatNumber(null)).toBe('—');
    expect(formatNumber(undefined)).toBe('—');
    expect(formatNumber(NaN)).toBe('—');
    expect(formatNumber(Infinity)).toBe('—');
  });

  it('returns "0" for zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('formats with Intl per locale', () => {
    // en-US uses comma as thousand separator
    expect(formatNumber(1234.567, 2, 'en')).toBe('1,234.57');
    // zh-Hans uses comma too
    expect(formatNumber(1234.567, 2, 'zh-hans')).toBe('1,234.57');
  });

  it('switches to exponential for very large/small numbers', () => {
    expect(formatNumber(1e15, 3, 'en')).toMatch(/e\+/);
    expect(formatNumber(1e-6, 3, 'en')).toMatch(/e-/);
  });
});

describe('formatDate()', () => {
  it('formats a date with locale-appropriate tokens', () => {
    const d = new Date(2026, 6, 30); // 2026-07-30 (local)
    const en = formatDate(d, 'en');
    const hans = formatDate(d, 'zh-hans');
    expect(en).toMatch(/2026/);
    expect(en).toMatch(/Jul/);
    expect(hans).toMatch(/2026/);
    expect(hans).toMatch(/7/); // 月
  });
});
