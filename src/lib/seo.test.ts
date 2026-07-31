// BDD tests for SEO primitives: builders, escaping, URL canonicalization.
import { describe, expect, it } from 'vitest';
import {
  serializeJsonLd,
  canonicalUrl,
  buildBreadcrumb,
  buildFaqPage,
  buildHowTo,
  globalGraph,
  type FaqItem,
} from './seo';
import { SITE } from './site';

describe('serializeJsonLd', () => {
  it('returns valid JSON', () => {
    const out = serializeJsonLd({ a: 1, b: 'hi' });
    expect(JSON.parse(out)).toEqual({ a: 1, b: 'hi' });
  });

  it('escapes < and > to keep JSON-LD safe in inline scripts', () => {
    const out = serializeJsonLd({ x: '<script>alert(1)</script>' });
    expect(out).not.toContain('<script>');
    expect(out).toContain('\\u003c');
    expect(JSON.parse(out).x).toBe('<script>alert(1)</script>');
  });

  it('escapes U+2028 and U+2029 line terminators', () => {
    const out = serializeJsonLd({ x: 'a b c' });
    expect(out).toContain('\\u2028');
    expect(out).toContain('\\u2029');
  });
});

describe('canonicalUrl', () => {
  it('appends trailing slash to rootless path', () => {
    expect(canonicalUrl('/meter-to-foot')).toBe(`${SITE.url}/meter-to-foot/`);
  });
  it('strips query and hash', () => {
    expect(canonicalUrl('/meter-to-foot?x=1#top')).toBe(`${SITE.url}/meter-to-foot/`);
  });
  it('keeps trailing slash', () => {
    expect(canonicalUrl('/faq/')).toBe(`${SITE.url}/faq/`);
  });
});

describe('globalGraph', () => {
  it('returns a WebSite with @id, inLanguage, publisher Organization', () => {
    const g = globalGraph() as any;
    expect(g['@type']).toBe('WebSite');
    expect(g['@id']).toBe(`${SITE.url}#website`);
    expect(g.inLanguage).toEqual(['en', 'zh-Hant', 'zh-Hans']);
    expect(g.publisher['@id']).toBe(`${SITE.url}#organization`);
    expect(g.publisher.sameAs.length).toBeGreaterThanOrEqual(1);
  });
});

describe('buildBreadcrumb', () => {
  it('returns Home-only list when path is root', () => {
    const b = buildBreadcrumb('/', { title: 'Home' }) as any;
    expect(b.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
    ]);
  });

  it('positions start at 1 and increment', () => {
    const b = buildBreadcrumb('/category/length', { title: 'Length' }) as any;
    expect(b.itemListElement[0].position).toBe(1);
    expect(b.itemListElement[1].position).toBe(2);
    expect(b.itemListElement[1].item).toBe(`${SITE.url}/category/`);
    expect(b.itemListElement[2].position).toBe(3);
    expect(b.itemListElement[2].item).toBe(`${SITE.url}/category/length/`);
    expect(b.itemListElement[2].name).toBe('Length'); // last segment uses page title
  });

  it('returns absolute URLs on every item', () => {
    const b = buildBreadcrumb('/meter-to-foot', { title: 'm to ft' }) as any;
    for (const it of b.itemListElement) {
      expect(it.item.startsWith('http')).toBe(true);
    }
  });
});

describe('buildFaqPage', () => {
  const items: FaqItem[] = [
    { q: 'What?', a: 'That.' },
    { q: 'How?', a: 'Like this.' },
  ];
  it('maps each question to Question + Answer', () => {
    const f = buildFaqPage(items) as any;
    expect(f['@type']).toBe('FAQPage');
    expect(f.mainEntity).toHaveLength(2);
    expect(f.mainEntity[0]['@type']).toBe('Question');
    expect(f.mainEntity[0].name).toBe('What?');
    expect(f.mainEntity[0].acceptedAnswer.text).toBe('That.');
  });
  it('preserves order', () => {
    const f = buildFaqPage(items) as any;
    expect(f.mainEntity.map((m: any) => m.name)).toEqual(['What?', 'How?']);
  });
});

describe('buildHowTo', () => {
  it('returns two ordered steps with URLs anchored to #converter', () => {
    const h = buildHowTo({
      name: 'How to convert m to ft',
      description: 'desc',
      step1Name: 'Enter m',
      step1Text: 'type',
      step2Name: 'Read ft',
      step2Text: 'look',
      toolName: 'm-to-ft',
      canonicalUrl: `${SITE.url}/meter-to-foot/`,
    }) as any;
    expect(h.step).toHaveLength(2);
    expect(h.step[0].position).toBe(1);
    expect(h.step[1].position).toBe(2);
    expect(h.step[0].url.endsWith('#converter')).toBe(true);
    expect(h.step[1].url.endsWith('#converter')).toBe(true);
  });
});