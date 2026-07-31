// Post-build sitemap generator. Walks dist/ for index.html files and emits
// sitemap-0.xml + sitemap-index.xml. Used because @astrojs/sitemap 3.x is
// incompatible with this project's catch-all route shape in Astro 4.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

const SITE_URL = 'https://unitbox.online';
const today = new Date().toISOString().slice(0, 10);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name === 'index.html') out.push(full);
  }
  return out;
}

function pathToUrl(file) {
  const rel = path.relative(DIST, file).replace(/index\.html$/, '').replace(/\\/g, '/');
  // Root: dist/index.html (the meta-refresh redirect) — emit as a single-slash root URL.
  if (rel === '' || rel === '.') return SITE_URL + '/';
  // Astro builds with directory-format; ensure trailing slash
  const withSlash = rel.endsWith('/') ? rel : rel + '/';
  // Skip bracketed route patterns that survived build (shouldn't happen, but be safe)
  if (/\[|%5B|%5D/.test(withSlash)) return null;
  return SITE_URL + '/' + withSlash;
}

if (!fs.existsSync(DIST)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}

const files = walk(DIST);
const urls = files.map(pathToUrl).filter(Boolean).sort();
console.log(`sitemap: ${urls.length} URLs`);

const sitemap0 = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map(u => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`),
  '</urlset>',
  '',
].join('\n');

const index_ = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  `  <sitemap><loc>${SITE_URL}/sitemap-0.xml</loc><lastmod>${today}</lastmod></sitemap>`,
  '</sitemapindex>',
  '',
].join('\n');

fs.writeFileSync(path.join(DIST, 'sitemap-0.xml'), sitemap0);
fs.writeFileSync(path.join(DIST, 'sitemap-index.xml'), index_);
console.log('wrote sitemap-0.xml + sitemap-index.xml');