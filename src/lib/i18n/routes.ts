// Route helpers for locale-prefixed URLs. Every in-app navigation link should
// pass through these so the path is always consistent with the current locale.

import { LOCALES, DEFAULT_LOCALE, IN_LANGUAGE, type Locale } from './locales';

/** Build a locale-prefixed URL path. Pass an unprefixed path like '/meter-to-foot'. */
export function route(locale: Locale, path: string): string {
  if (path === '' || path === '/') return `/${locale}`;
  // Strip leading slash from `path` to avoid double slashes
  const trimmed = path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${trimmed}`;
}

/** Build a hreflang URL for a given locale (used in <link rel="alternate">). */
export function hreflangUrl(locale: Locale, path: string): string {
  return route(locale, path);
}

/** Strip the locale prefix from a pathname, returning the suffix. Used when
 *  switching locale for the current page. */
export function stripLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return '/';
  // If first segment is a known locale, drop it
  if (segments.length >= 1 && (LOCALES as readonly string[]).includes(segments[0])) {
    return '/' + segments.slice(1).join('/');
  }
  return pathname;
}

/** For non-locale routes (sitemap, robots.txt, og image, llms.txt-only-root). */
export const ROOT_PATHS = {
  robots: '/robots.txt',
  sitemap: '/sitemap-index.xml',
  openapi: '/openapi.json',
  llms: '/llms.txt',
  ogImage: '/og-default.png',
  favicon: '/favicon.svg',
} as const;

/** Build a hreflang alternate block — emit one <link> per locale + x-default.
 *  Iterates LOCALES so new locales are picked up automatically. */
export function hreflangTags(currentPath: string, baseUrl = 'https://unitbox.online') {
  const suffix = stripLocale(currentPath);
  const tags: Array<{ hreflang: string; href: string }> = LOCALES.map((loc) => ({
    hreflang: IN_LANGUAGE[loc],
    href: `${baseUrl}${route(loc, suffix)}`,
  }));
  tags.push({ hreflang: 'x-default', href: `${baseUrl}${route(DEFAULT_LOCALE, suffix)}` });
  return tags;
}
