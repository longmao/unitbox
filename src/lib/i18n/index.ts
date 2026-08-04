// i18n API for unitbox. Four locale dictionaries (en/zh-hant/zh-hans/ja) wired
// up via a single `t(key, locale)` lookup. Number formatting is Intl-aware.
//
// Build-time invariant: every key from EN must exist in ZH_HANT, ZH_HANS, JA.
// The assertion below runs at module init and throws if the key sets drift.

import {
  LOCALES, DEFAULT_LOCALE, INTL_LOCALE, LOCALE_LABELS, OG_LOCALE, IN_LANGUAGE, isLocale,
  type Locale,
} from './locales';
import { EN } from './en';
import { ZH_HANT } from './zh-hant';
import { ZH_HANS } from './zh-hans';
import { JA } from './ja';
import { KO } from './ko';

const DICTS: Record<Locale, Record<string, string>> = {
  'en': EN,
  'zh-hant': ZH_HANT,
  'zh-hans': ZH_HANS,
  'ja': JA,
  'ko': KO,
};

// ── Build-time assertions (run once at module init) ──────────────────────────
const enKeys = Object.keys(EN).sort();
for (const [name, dict] of [['zh-hant', ZH_HANT], ['zh-hans', ZH_HANS], ['ja', JA], ['ko', KO]] as Array<[string, Record<string, string>]>) {
  const keys = Object.keys(dict).sort();
  if (keys.length !== enKeys.length) {
    throw new Error(`i18n drift: ${name} has ${keys.length} keys, EN has ${enKeys.length}`);
  }
  for (let i = 0; i < enKeys.length; i++) {
    if (enKeys[i] !== keys[i]) {
      throw new Error(`i18n drift at key[${i}]: EN="${enKeys[i]}" vs ${name}="${keys[i]}"`);
    }
  }
}

// ── Translation ──────────────────────────────────────────────────────────────
/** Look up a translation. Falls back to English if key missing or locale unknown. */
export function t(key: string, locale: Locale = DEFAULT_LOCALE): string {
  const dict = DICTS[locale] ?? DICTS[DEFAULT_LOCALE];
  const value = dict[key];
  if (value !== undefined) return value;
  const fallback = DICTS[DEFAULT_LOCALE][key];
  return fallback ?? key;
}

/** Interpolate {placeholders} in a translated string. */
export function tFmt(key: string, locale: Locale, vars: Record<string, string | number>): string {
  let s = t(key, locale);
  for (const [k, v] of Object.entries(vars)) {
    s = s.replace(`{${k}}`, String(v));
  }
  return s;
}

// ── Intl wrappers ────────────────────────────────────────────────────────────
/** Locale-aware number formatter. Keeps the smart-trim behaviour but uses Intl.NumberFormat. */
export function formatNumber(n: number | null | undefined, precision = 6, locale: Locale = DEFAULT_LOCALE): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e12 || abs < 1e-4) {
    return n.toExponential(Math.max(0, precision - 2));
  }
  const factor = Math.pow(10, precision);
  const rounded = Math.round(n * factor) / factor;
  return rounded.toLocaleString(INTL_LOCALE[locale] ?? 'en-US', {
    maximumFractionDigits: precision,
  });
}

/** Locale-aware date formatter. */
export function formatDate(d: Date, locale: Locale = DEFAULT_LOCALE): string {
  return d.toLocaleDateString(INTL_LOCALE[locale] ?? 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ── Re-exports ───────────────────────────────────────────────────────────────
export { LOCALES, DEFAULT_LOCALE, LOCALE_LABELS, OG_LOCALE, IN_LANGUAGE, INTL_LOCALE, isLocale };
export type { Locale };
