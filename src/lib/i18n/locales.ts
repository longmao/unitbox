// Locale registry for unitbox. Each locale is an independent static-rendered
// HTML tree under `/[locale]/`. Same URL, different content surface so
// Google crawlers (no JS) see locale-correct <html lang> + hreflang.

export const LOCALES = ['en', 'zh-hant', 'zh-hans', 'ja', 'ko'] as const;
export type Locale = typeof LOCALES[number];

export const DEFAULT_LOCALE: Locale = 'en';

/** Map our locale → BCP-47 intl tag used by Intl.NumberFormat / Intl.DateTimeFormat. */
export const INTL_LOCALE: Record<Locale, string> = {
  'en': 'en-US',
  'zh-hant': 'zh-Hant',
  'zh-hans': 'zh-Hans',
  'ja': 'ja-JP',
  'ko': 'ko-KR',
};

/** Display label for the language switcher. */
export const LOCALE_LABELS: Record<Locale, string> = {
  'en': 'English',
  'zh-hant': '繁體中文',
  'zh-hans': '简体中文',
  'ja': '日本語',
  'ko': '한국어',
};

/** Locale-specific OG/SEO value for `og:locale` and JSON-LD `inLanguage`. */
export const OG_LOCALE: Record<Locale, string> = {
  'en': 'en_US',
  'zh-hant': 'zh_Hant',
  'zh-hans': 'zh_Hans',
  'ja': 'ja_JP',
  'ko': 'ko_KR',
};

/** `inLanguage` value for JSON-LD (BCP-47 simplified). */
export const IN_LANGUAGE: Record<Locale, string> = {
  'en': 'en',
  'zh-hant': 'zh-Hant',
  'zh-hans': 'zh-Hans',
  'ja': 'ja',
  'ko': 'ko',
};

export function isLocale(s: string | null | undefined): s is Locale {
  return typeof s === 'string' && (LOCALES as readonly string[]).includes(s);
}
