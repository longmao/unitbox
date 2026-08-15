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

/** Interpolate {placeholders} in a translated string. Uses replaceAll so duplicate placeholders
 *  (e.g. {cat} appearing twice in cat.page-title) all render instead of only the first. */
export function tFmt(key: string, locale: Locale, vars: Record<string, string | number>): string {
  let s = t(key, locale);
  for (const [k, v] of Object.entries(vars)) {
    s = s.replaceAll(`{${k}}`, String(v));
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

/**
 * Minimal markdown→HTML for narrative content on unit detail pages.
 *
 * Supports only:
 *   ## Heading 2      → <h2>Heading 2</h2>
 *   ### Heading 3     → <h3>Heading 3</h3>
 *   blank-line break  → </p><p>
 *   plain text        → escaped & inserted verbatim
 *
 * Intentionally tiny — no links, no bold, no lists. Narrative content is
 * hand-written, low-formatting, and pre-validated, so a heavy markdown parser
 * would add bundle weight and risk footguns. If we ever need more, swap in
 * marked or remark.
 */
export function narrativeInline(text: string): string {
  if (!text) return '';
  const escape = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  const blocks = text.split(/\n{2,}/);
  return blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('### ')) {
        return `<h3>${escape(trimmed.slice(4))}</h3>`;
      }
      if (trimmed.startsWith('## ')) {
        return `<h2>${escape(trimmed.slice(3))}</h2>`;
      }
      return `<p>${escape(trimmed).replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');
}

// ── Re-exports ───────────────────────────────────────────────────────────────
export { LOCALES, DEFAULT_LOCALE, LOCALE_LABELS, OG_LOCALE, IN_LANGUAGE, INTL_LOCALE, isLocale };
export type { Locale };
