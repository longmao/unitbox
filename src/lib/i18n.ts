// Backward-compatibility shim — re-exports the new i18n module under the
// old `~/lib/i18n` import path so existing pages keep working while we
// migrate them to use the directory structure.

export {
  LOCALES,
  DEFAULT_LOCALE,
  LOCALE_LABELS,
  OG_LOCALE,
  IN_LANGUAGE,
  INTL_LOCALE,
  isLocale,
  t,
  tFmt,
  formatNumber,
  formatDate,
} from './i18n/index';
export type { Locale } from './i18n/locales';
