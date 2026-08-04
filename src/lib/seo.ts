// SEO primitives: schema.org builders, safe JSON-LD serialization, breadcrumb helpers.
import { SITE } from './site';

export interface FaqItem {
  q: string;
  a: string;
}
export interface BreadcrumbItem {
  name: string;
  href: string;
}

interface SchemaBase {
  '@context': 'https://schema.org';
  '@type': string;
  '@id'?: string;
  [key: string]: unknown;
}

/** Serialize any object to a JSON-LD-safe string. Escapes characters that break inline `<script>` blocks. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/** Normalize a path → canonical absolute URL on the production site. */
export function canonicalUrl(pathname: string): string {
  const cleaned = pathname.split('#')[0].split('?')[0];
  const withSlash = cleaned.endsWith('/') ? cleaned : cleaned + '/';
  const rel = withSlash.startsWith('/') ? withSlash : '/' + withSlash;
  return new URL(rel, SITE.url).href;
}

/** Build a global @graph containing Organization + WebSite. Always injected by Base.astro. */
export function globalGraph(opts?: { description?: string; inLanguage?: string | string[] }): SchemaBase {
  const desc = opts?.description ?? SITE.description;
  const inLanguage = Array.isArray(opts?.inLanguage)
    ? opts.inLanguage
    : (opts?.inLanguage ? [opts.inLanguage] : ['en', 'zh-Hant', 'zh-Hans']);
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}#website`,
    name: SITE.name,
    alternateName: ['unitbox', 'unitbox.online'],
    url: SITE.url,
    description: desc,
    inLanguage,
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE.url}#organization`,
      name: SITE.legalName,
      url: SITE.url,
      logo: `${SITE.url}/logo-outline.svg`,
      email: 'hi@unitbox.online',
      sameAs: [
        `https://twitter.com/${SITE.twitterHandle.replace('@', '')}`,
        `https://github.com/longmao/unitbox`,
        `https://www.linkedin.com/company/unitbox`,
        `https://en.wikipedia.org/wiki/Conversion_of_units`,
        `https://www.wikidata.org/wiki/Q1269852`,
      ],
    },
  } as unknown as SchemaBase;
}

/** Build a BreadcrumbList from the URL path. Last segment uses the page title, others are path-segment labels. */
export function buildBreadcrumb(
  pathname: string,
  opts: { title: string; segmentLabels?: Record<string, string> },
): SchemaBase {
  const segments = pathname.split('/').filter(Boolean);
  const items: { '@type': 'ListItem'; position: number; name: string; item: string }[] = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: canonicalUrl('/') },
  ];
  segments.forEach((seg, i) => {
    const isLast = i === segments.length - 1;
    const label = isLast
      ? opts.title
      : opts.segmentLabels?.[seg] ?? titleCase(decodeURIComponent(seg));
    const itemPath = '/' + segments.slice(0, i + 1).join('/') + '/';
    items.push({
      '@type': 'ListItem',
      position: i + 2,
      name: label,
      item: canonicalUrl(itemPath),
    });
  });
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

/** Build an FAQPage schema from the exact `faq` array rendered by FaqBlock. */
export function buildFaqPage(items: FaqItem[], opts?: { inLanguage?: string }): SchemaBase {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: opts?.inLanguage ?? 'en',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };
}

/** Build an Article schema (BlogPosting) for /articles/[slug] pages. */
export function buildArticle(opts: {
  headline: string;
  description: string;
  url: string;
  inLanguage: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  authorUrl: string;
  category?: string;
  keywords?: string;
  image?: string;
}): SchemaBase {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${opts.url}#article`,
    headline: opts.headline,
    description: opts.description,
    url: opts.url,
    image: opts.image ?? `${SITE.url}${SITE.ogImage}`,
    inLanguage: opts.inLanguage,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    author: {
      '@type': 'Organization',
      name: opts.authorName,
      url: opts.authorUrl,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE.url}#organization`,
      name: SITE.legalName,
      url: SITE.url,
      logo: `${SITE.url}/logo-outline.svg`,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': opts.url },
    ...(opts.category ? { articleSection: opts.category } : {}),
    ...(opts.keywords ? { keywords: opts.keywords } : {}),
  } as unknown as SchemaBase;
}

/** Build a HowTo schema for a converter page. */
export function buildHowTo(opts: {
  name: string;
  description: string;
  step1Name: string;
  step1Text: string;
  step2Name: string;
  step2Text: string;
  toolName: string;
  canonicalUrl: string;
}): SchemaBase {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: opts.name,
    description: opts.description,
    inLanguage: 'en',
    totalTime: 'PT1M',
    tool: [{ '@type': 'HowToTool', name: opts.toolName }],
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: opts.step1Name,
        text: opts.step1Text,
        url: `${opts.canonicalUrl}#converter`,
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: opts.step2Name,
        text: opts.step2Text,
        url: `${opts.canonicalUrl}#converter`,
      },
    ],
  };
}

function titleCase(s: string): string {
  return s
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}