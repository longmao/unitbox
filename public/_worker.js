// CF Pages _worker.js · root-path language negotiation
// Intercepts GET / only; all other paths fall through to static assets (env.ASSETS).
// Map Accept-Language → one of unitbox's 5 locales, 302 to /<locale>/.
// Honors ?force=<locale> for manual override; no cookies (privacy-first, matches site ethos).

const LOCALE_PRIORITY = ['zh-hans', 'zh-hant', 'ja', 'ko', 'en'];

/**
 * Parse Accept-Language header → best-matching locale.
 * zh-CN/zh-SG/zh-Hans → zh-hans; zh-TW/zh-HK/zh-Hant → zh-hant.
 * Falls back to 'en'.
 */
function pickLocale(acceptLanguage) {
  if (!acceptLanguage) return 'en';
  const entries = acceptLanguage.split(',').map((part) => {
    const [tag, qPart = 'q=1'] = part.trim().split(';');
    const lang = tag.trim().toLowerCase();
    const q = parseFloat((qPart.split('=')[1] || '1'));
    return { lang, q: isNaN(q) ? 1 : q };
  }).sort((a, b) => b.q - a.q);

  for (const { lang } of entries) {
    if (lang === '*' || !lang) continue;
    if (lang.startsWith('zh')) {
      // Simplified: mainland China, Singapore, or bare "zh"
      if (lang.includes('cn') || lang.includes('sg') || lang.includes('hans') || lang === 'zh') return 'zh-hans';
      // Traditional: Taiwan, Hong Kong, Macau
      if (lang.includes('tw') || lang.includes('hk') || lang.includes('mo') || lang.includes('hant')) return 'zh-hant';
      return 'zh-hans'; // ambiguous zh → simplified (largest population)
    }
    if (lang.startsWith('ja')) return 'ja';
    if (lang.startsWith('ko')) return 'ko';
    if (lang.startsWith('en')) return 'en';
  }
  return 'en';
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Only negotiate the bare root. Everything else → static assets.
    // (trailing-slash variants, /favicon, /llms.txt, /<locale>/... all pass through)
    if (url.pathname !== '/') {
      return env.ASSETS.fetch(request);
    }

    // Manual override: /?force=zh-hant (no cookie set — stateless, privacy-first)
    const force = url.searchParams.get('force');
    if (force && LOCALE_PRIORITY.includes(force)) {
      return Response.redirect(`${url.origin}/${force}/`, 302);
    }

    const acceptLang = request.headers.get('accept-language') || '';
    const locale = pickLocale(acceptLang);
    return Response.redirect(`${url.origin}/${locale}/`, 302);
  },
};
