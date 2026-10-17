// BDD for the PNG compressor page. Verifies:
// 1. The page renders at all locale URLs
// 2. Required JSON-LD (SoftwareApplication, FAQPage, HowTo) is present
// 3. The i18n JSON embedded in the page produces correct UI strings

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const DIST = path.join(process.cwd(), 'dist');

describe('PNG compressor page', () => {
  const locales = ['en', 'zh-hant', 'zh-hans', 'ja', 'ko'] as const;

  for (const locale of locales) {
    it(`renders at /${locale}/tools/png-compressor/`, () => {
      const file = path.join(DIST, locale, 'tools', 'png-compressor', 'index.html');
      expect(fs.existsSync(file)).toBe(true);
    });

    it(`/${locale}/ has correct <html lang>`, () => {
      const file = path.join(DIST, locale, 'tools', 'png-compressor', 'index.html');
      const html = fs.readFileSync(file, 'utf8');
      const expectedLang = ({ en: 'en', 'zh-hant': 'zh-Hant', 'zh-hans': 'zh-Hans', ja: 'ja', ko: 'ko' } as const)[locale];
      expect(html).toMatch(new RegExp(`<html lang="${expectedLang}"`));
    });

    it(`/${locale}/ has SoftwareApplication JSON-LD`, () => {
      const file = path.join(DIST, locale, 'tools', 'png-compressor', 'index.html');
      const html = fs.readFileSync(file, 'utf8');
      expect(html).toContain('SoftwareApplication');
    });

    it(`/${locale}/ has FAQPage JSON-LD`, () => {
      const file = path.join(DIST, locale, 'tools', 'png-compressor', 'index.html');
      const html = fs.readFileSync(file, 'utf8');
      expect(html).toContain('FAQPage');
    });

    it(`/${locale}/ has HowTo JSON-LD`, () => {
      const file = path.join(DIST, locale, 'tools', 'png-compressor', 'index.html');
      const html = fs.readFileSync(file, 'utf8');
      expect(html).toContain('HowTo');
    });

    it(`/${locale}/ has 3 privacy pills rendered`, () => {
      const file = path.join(DIST, locale, 'tools', 'png-compressor', 'index.html');
      const html = fs.readFileSync(file, 'utf8');
      const pillCount = (html.match(/class="pill"/g) ?? []).length;
      expect(pillCount).toBe(3);
    });

    it(`/${locale}/ has the dropzone UI`, () => {
      const file = path.join(DIST, locale, 'tools', 'png-compressor', 'index.html');
      const html = fs.readFileSync(file, 'utf8');
      expect(html).toContain('id="png-drop"');
      expect(html).toContain('id="png-input"');
    });

    it(`/${locale}/ has 6 hreflang alternate tags (5 locales + x-default)`, () => {
      const file = path.join(DIST, locale, 'tools', 'png-compressor', 'index.html');
      const html = fs.readFileSync(file, 'utf8');
      const hreflangCount = (html.match(/rel="alternate" hreflang="/g) ?? []).length;
      expect(hreflangCount).toBe(6);
    });

    it(`/${locale}/ has the i18n JSON for the client component`, () => {
      const file = path.join(DIST, locale, 'tools', 'png-compressor', 'index.html');
      const html = fs.readFileSync(file, 'utf8');
      // JSON is HTML-encoded in the data-i18n attribute (quotes → &#34;)
      expect(html).toMatch(/data-i18n="\{&#34;[^"]*&#34;dropzone&#34;/);
    });

    it(`/${locale}/ has the canvas compressor script + UPNG.js`, () => {
      const file = path.join(DIST, locale, 'tools', 'png-compressor', 'index.html');
      const html = fs.readFileSync(file, 'utf8');
      // Compressor logic + UPNG.js are bundled into /_astro/hoisted.*.js (the
      // `import * as UPNG` triggers Vite's hoisted-module pipeline).
      const match = html.match(/<script type="module" src="(\/_astro\/hoisted\.[^"]+)"/);
      expect(match, 'PNG compressor page should have a hoisted module script').toBeTruthy();
      const jsFile = path.join(DIST, match![1]);
      const js = fs.readFileSync(jsFile, 'utf8');
      // Global APIs survive minification; UPNG surface markers: IDAT/IHDR/cnum.
      expect(js).toMatch(/createImageBitmap/);
      expect(js).toMatch(/canvas/);
      expect(js).toMatch(/toBlob/);
      expect(js).toMatch(/image\/png/);
      expect(js).toMatch(/cnum|IHDR|IDAT/);
    });
  }

  it('sitemap includes all 5 PNG compressor URLs', () => {
    const sitemap = fs.readFileSync(path.join(DIST, 'sitemap-0.xml'), 'utf8');
    expect(sitemap).toContain('https://unitbox.online/en/tools/png-compressor/');
    expect(sitemap).toContain('https://unitbox.online/zh-hant/tools/png-compressor/');
    expect(sitemap).toContain('https://unitbox.online/zh-hans/tools/png-compressor/');
    expect(sitemap).toContain('https://unitbox.online/ja/tools/png-compressor/');
    expect(sitemap).toContain('https://unitbox.online/ko/tools/png-compressor/');
  });

  it('PNG compressor link is in the footer Products list of all locales', () => {
    for (const locale of ['en', 'zh-hant', 'zh-hans', 'ja', 'ko']) {
      const file = path.join(DIST, locale, 'index.html');
      const html = fs.readFileSync(file, 'utf8');
      expect(html, `${locale} home should link to PNG compressor`).toContain(`/${locale}/tools/png-compressor`);
    }
  });

  it('home page has 5 hero chips (3 categories + 2 tools) in all locales', () => {
    for (const locale of ['en', 'zh-hant', 'zh-hans', 'ja', 'ko']) {
      const file = path.join(DIST, locale, 'index.html');
      const html = fs.readFileSync(file, 'utf8');
      const chips = (html.match(/<a [^>]*class="hero-chip/g) ?? []).length;
      expect(chips, `${locale} home should have 5 hero chips`).toBe(5);
      expect(html).toMatch(/class="hero-chip[^"]*hero-chip-tool/);
    }
  });

  it('home page has Tools section in all locales', () => {
    for (const locale of ['en', 'zh-hant', 'zh-hans', 'ja', 'ko']) {
      const file = path.join(DIST, locale, 'index.html');
      const html = fs.readFileSync(file, 'utf8');
      expect(html).toContain('tools-section');
      expect(html).toContain('tool-card-png');
      expect(html).toContain('tool-card');
    }
  });

  it('SoftwareApplication schema has price=0 and isAccessibleForFree', () => {
    const file = path.join(DIST, 'en', 'tools', 'png-compressor', 'index.html');
    const html = fs.readFileSync(file, 'utf8');
    expect(html).toContain('"price":"0"');
    expect(html).toContain('"isAccessibleForFree":true');
  });
});
