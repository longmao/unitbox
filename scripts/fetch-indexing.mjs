#!/usr/bin/env node
// scripts/fetch-indexing.mjs
// GSC Indexing API publisher. Hand-rolled JWT (zero deps, matches fetch-gsc.mjs).
// Pushes sitemap URLs to Google for immediate crawl.
// Usage:
//   node scripts/fetch-indexing.mjs --sitemap dist/sitemap-0.xml --limit 100
//   node scripts/fetch-indexing.mjs --url https://unitbox.online/
//   node scripts/fetch-indexing.mjs --verify
//
// Quota: 200 publish calls/day (default). 100 URLs = 100 calls.
// SA scope required: https://www.googleapis.com/auth/indexing

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SA_PATH = path.join(ROOT, '.gsc/sa.json');
const SCOPE = 'https://www.googleapis.com/auth/indexing';
const SITE = 'https://unitbox.online';

if (!fs.existsSync(SA_PATH)) { console.error('[idx] missing SA at', SA_PATH); process.exit(1); }
const SA = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));

const b64u = b => Buffer.from(b).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

async function getToken() {
  const now = Math.floor(Date.now() / 1000);
  const h = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const c = b64u(JSON.stringify({ iss: SA.client_email, scope: SCOPE, aud: SA.token_uri, iat: now, exp: now + 3600 }));
  const sig = (await import('crypto')).sign('RSA-SHA256', Buffer.from(`${h}.${c}`), SA.private_key);
  const jwt = `${h}.${c}.${b64u(sig)}`;
  const r = await fetch(SA.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  if (!r.ok) throw new Error(`token ${r.status}: ${await r.text()}`);
  return (await r.json()).access_token;
}

async function publish(t, url) {
  const r = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, type: 'URL_UPDATED' }),
  });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, body: j };
}

async function getMetadata(t, url) {
  const r = await fetch(`https://indexing.googleapis.com/v3/urlNotifications/metadata?url=${encodeURIComponent(url)}`, {
    headers: { 'Authorization': `Bearer ${t}` },
  });
  return r.json().catch(() => ({}));
}

function extractUrlsFromSitemap(xml) {
  const urls = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) urls.push(m[1]);
  return urls;
}

// High-intent head terms (mirrors prioritize-indexing.mjs).
const HEAD = [
  'celsius-to-fahrenheit','fahrenheit-to-celsius','km-to-mile','mile-to-km',
  'kg-to-pound','pound-to-kg','cm-to-inch','inch-to-cm','mb-to-mb',
  'gb-to-mb','mb-to-gb','gb-to-tb','liter-to-gallon','gallon-to-liter',
  'meter-to-feet','feet-to-meter','inch-to-mm','mm-to-inch','byte-to-mb',
  'cup-to-ml','ml-to-cup','ounce-to-gram','gram-to-ounce','fahrenheit-to-kelvin',
];

// Rank so the cron's 100/day quota hits cross-locale high-value pages
// (homes → articles → apple-dev → head → rest) instead of the first 100 en URLs
// in raw sitemap order (which left every non-en locale uncrawlable via cron).
function rankUrls(all, limit) {
  const LOCALES = ['/en/', '/zh-hans/', '/zh-hant/', '/ja/', '/ko/'];
  const homes = [`${SITE}/`, ...LOCALES.map(l => `${SITE}${l}`)].filter(u => all.includes(u));
  const articles = all.filter(u => /\/articles\//.test(u));
  const appleDev = all.filter(u => /\/apple-dev\//.test(u));
  const headUrls = [];
  for (const term of HEAD) for (const loc of LOCALES) { const u = `${SITE}${loc}${term}/`; if (all.includes(u)) headUrls.push(u); }
  const rest = all.filter(u => !homes.includes(u) && !articles.includes(u) && !appleDev.includes(u) && !headUrls.includes(u));
  return [...new Set([...homes, ...articles, ...appleDev, ...headUrls, ...rest])].slice(0, limit);
}

async function main() {
  const args = process.argv.slice(2);
  const verify = args.includes('--verify');
  const dryRun = args.includes('--dry-run');
  const limitArg = args.find(a => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.slice(8), 10) : 100;
  const sitemapArg = args.find(a => a.startsWith('--sitemap='));
  const urlArg = args.find(a => a.startsWith('--url='));

  const t = await getToken();

  if (verify) {
    // Try metadata for a known URL
    const meta = await getMetadata(t, SITE + '/en/');
    console.log('[idx] auth OK · metadata call OK ·', JSON.stringify(meta).slice(0, 200));
    return;
  }

  let urls = [];
  if (urlArg) {
    urls = [urlArg.slice(6)];
  } else {
    const sitemapPath = sitemapArg ? path.resolve(ROOT, sitemapArg.slice(10)) : path.join(ROOT, 'dist/sitemap-0.xml');
    if (!fs.existsSync(sitemapPath)) {
      console.error('[idx] sitemap not found:', sitemapPath);
      process.exit(1);
    }
    urls = rankUrls(extractUrlsFromSitemap(fs.readFileSync(sitemapPath, 'utf8')), limit);
  }

  if (dryRun) {
    const bucket = u => /\/apple-dev\//.test(u) ? 'apple-dev' : /\/articles\//.test(u) ? 'articles' : /\/(en|zh-hans|zh-hant)\/?$/.test(u.replace(SITE, '')) ? 'homes/head' : 'rest';
    const dist = {};
    for (const u of urls) dist[bucket(u)] = (dist[bucket(u)] || 0) + 1;
    console.log(`[idx] dry-run · top ${urls.length} bucket:`, JSON.stringify(dist));
    urls.slice(0, 10).forEach((u, i) => console.log(`  ${(i + 1).toString().padStart(3)}  ${u.replace(SITE, '')}`));
    return;
  }

  console.log(`[idx] publishing ${urls.length} URLs (quota: 200/day) ...`);

  const results = [];
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      const r = await publish(t, url);
      results.push({ url, ok: r.ok, status: r.status });
      if (i % 20 === 0) console.log(`  [${i+1}/${urls.length}] ${r.ok ? 'OK' : 'FAIL'} ${r.status} ${url}`);
    } catch (e) {
      results.push({ url, ok: false, status: 0, error: e.message });
    }
    // Light rate limit to avoid quota burst
    await new Promise(res => setTimeout(res, 100));
  }

  const okCount = results.filter(r => r.ok).length;
  const failCount = results.length - okCount;
  console.log(`\n[idx] DONE · OK=${okCount} FAIL=${failCount} · ${results.length} total`);

  // Save log
  const logPath = path.join(ROOT, '.observe', new Date().toISOString().slice(0, 10), 'indexing-publish.json');
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.writeFileSync(logPath, JSON.stringify({
    date: new Date().toISOString().slice(0, 10),
    fetch_ts: new Date().toISOString(),
    total: results.length,
    ok: okCount,
    fail: failCount,
    results: results.slice(0, 200),
  }, null, 2));
  console.log(`[idx] log: ${logPath}`);
}

main().catch(e => { console.error('[idx] FAIL:', e.message); process.exit(1); });
