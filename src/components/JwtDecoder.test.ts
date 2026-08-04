// BDD for the JWT decoder page. Verifies:
// 1. Renders at all locale URLs
// 2. Required JSON-LD (SoftwareApplication, FAQPage, HowTo)
// 3. Privacy pills, input UI, hoisted decode script, i18n injection

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const DIST = path.join(process.cwd(), 'dist');

describe('JWT decoder page', () => {
  const locales = ['en', 'zh-hant', 'zh-hans', 'ja', 'ko'] as const;

  for (const locale of locales) {
    it(`renders at /${locale}/tools/jwt-decoder/`, () => {
      const file = path.join(DIST, locale, 'tools', 'jwt-decoder', 'index.html');
      expect(fs.existsSync(file)).toBe(true);
    });

    it(`/${locale}/ has correct <html lang>`, () => {
      const file = path.join(DIST, locale, 'tools', 'jwt-decoder', 'index.html');
      const html = fs.readFileSync(file, 'utf8');
      const expectedLang = ({ en: 'en', 'zh-hant': 'zh-Hant', 'zh-hans': 'zh-Hans', ja: 'ja', ko: 'ko' } as const)[locale];
      expect(html).toMatch(new RegExp(`<html lang="${expectedLang}"`));
    });

    it(`/${locale}/ has SoftwareApplication JSON-LD`, () => {
      const file = path.join(DIST, locale, 'tools', 'jwt-decoder', 'index.html');
      const html = fs.readFileSync(file, 'utf8');
      expect(html).toContain('SoftwareApplication');
    });

    it(`/${locale}/ has FAQPage JSON-LD`, () => {
      const file = path.join(DIST, locale, 'tools', 'jwt-decoder', 'index.html');
      const html = fs.readFileSync(file, 'utf8');
      expect(html).toContain('FAQPage');
    });

    it(`/${locale}/ has HowTo JSON-LD`, () => {
      const file = path.join(DIST, locale, 'tools', 'jwt-decoder', 'index.html');
      const html = fs.readFileSync(file, 'utf8');
      expect(html).toContain('HowTo');
    });

    it(`/${locale}/ has 3 privacy pills rendered`, () => {
      const file = path.join(DIST, locale, 'tools', 'jwt-decoder', 'index.html');
      const html = fs.readFileSync(file, 'utf8');
      const pillCount = (html.match(/class="pill"/g) ?? []).length;
      expect(pillCount).toBe(3);
    });

    it(`/${locale}/ has the JWT input UI`, () => {
      const file = path.join(DIST, locale, 'tools', 'jwt-decoder', 'index.html');
      const html = fs.readFileSync(file, 'utf8');
      expect(html).toContain('id="jwt-input"');
      expect(html).toContain('id="jwt-decode-btn"');
      expect(html).toContain('id="jwt-sample-btn"');
    });

    it(`/${locale}/ has 6 hreflang alternate tags (5 locales + x-default)`, () => {
      const file = path.join(DIST, locale, 'tools', 'jwt-decoder', 'index.html');
      const html = fs.readFileSync(file, 'utf8');
      const hreflangCount = (html.match(/rel="alternate" hreflang="/g) ?? []).length;
      expect(hreflangCount).toBe(6);
    });

    it(`/${locale}/ has the i18n JSON for the client component`, () => {
      const file = path.join(DIST, locale, 'tools', 'jwt-decoder', 'index.html');
      const html = fs.readFileSync(file, 'utf8');
      // JSON is HTML-encoded in the data-i18n attribute (quotes → &#34;)
      expect(html).toMatch(/data-i18n="\{&#34;[^"]*&#34;input-label&#34;/);
    });

    it(`/${locale}/ has the hoisted decode script + JWT markers`, () => {
      const file = path.join(DIST, locale, 'tools', 'jwt-decoder', 'index.html');
      const html = fs.readFileSync(file, 'utf8');
      const match = html.match(/<script type="module" src="(\/_astro\/hoisted\.[^"]+)"/);
      expect(match, 'JWT decoder page should have a hoisted module script').toBeTruthy();
      const jsFile = path.join(DIST, match![1]);
      const js = fs.readFileSync(jsFile, 'utf8');
      // Native APIs survive minification; jwt.ts uses atob + TextDecoder for base64url/UTF-8.
      expect(js).toMatch(/atob/);
      expect(js).toMatch(/TextDecoder/);
      expect(js).toMatch(/JSON\.parse/);
    });
  }

  it('sitemap includes all 5 JWT decoder URLs', () => {
    const sitemap = fs.readFileSync(path.join(DIST, 'sitemap-0.xml'), 'utf8');
    expect(sitemap).toContain('https://unitbox.online/en/tools/jwt-decoder/');
    expect(sitemap).toContain('https://unitbox.online/zh-hant/tools/jwt-decoder/');
    expect(sitemap).toContain('https://unitbox.online/zh-hans/tools/jwt-decoder/');
    expect(sitemap).toContain('https://unitbox.online/ja/tools/jwt-decoder/');
    expect(sitemap).toContain('https://unitbox.online/ko/tools/jwt-decoder/');
  });

  it('JWT decoder link is in the footer Products list of all locales', () => {
    for (const locale of ['en', 'zh-hant', 'zh-hans', 'ja', 'ko']) {
      const file = path.join(DIST, locale, 'index.html');
      const html = fs.readFileSync(file, 'utf8');
      expect(html, `${locale} home should link to JWT decoder`).toContain(`/${locale}/tools/jwt-decoder`);
    }
  });

  it('home page has a JWT tool card in the tools section', () => {
    for (const locale of ['en', 'zh-hant', 'zh-hans', 'ja', 'ko']) {
      const file = path.join(DIST, locale, 'index.html');
      const html = fs.readFileSync(file, 'utf8');
      expect(html).toContain('tools-section');
      expect(html).toContain('tool-card-jwt');
      expect(html).toContain('tool-card');
    }
  });

  it('SoftwareApplication schema has price=0 and isAccessibleForFree', () => {
    const file = path.join(DIST, 'en', 'tools', 'jwt-decoder', 'index.html');
    const html = fs.readFileSync(file, 'utf8');
    expect(html).toContain('"price":"0"');
    expect(html).toContain('"isAccessibleForFree":true');
  });
});
