#!/usr/bin/env node
// scripts/prioritize-indexing.mjs
// Submit the HIGHEST-VALUE URLs to Google Indexing API first.
// New domains get a slow crawl budget; spending the 200/day quota on hand-written
// articles + locale homes + high-intent conversions (not random acre→angstrom pages)
// gives Google the best "this site has real content" signal → faster indexing.
//
// Ranking (filled to QUOTA=199, leaving 1 for the cron's own run):
//   T1 · locale homes + root (4)
//   T2 · all articles × 3 locales (hand-written, highest quality)
//   T3 · high-intent conversions (temp/length/weight/volume head terms) × 3 locales
//   T4 · fill remaining with top-of-sitemap conversions
//
// Usage:
//   node scripts/prioritize-indexing.mjs                 # push (uses 199 of 200 quota)
//   node scripts/prioritize-indexing.mjs --dry-run       # print ranked list, no push
//   node scripts/prioritize-indexing.mjs --limit 50      # override

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SA_PATH = path.join(ROOT, '.gsc', 'sa.json');
const SITEMAP = path.join(ROOT, 'dist', 'sitemap-0.xml');
const OUT_DIR = path.join(ROOT, '.observe');
const QUOTA = 199;                          // Google Indexing API = 200/day; leave 1 spare
const SCOPE = 'https://www.googleapis.com/auth/indexing';
const SITE = 'https://unitbox.online';

const SA = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));
const b64u = b => Buffer.from(b).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

async function getToken() {
  const now = Math.floor(Date.now() / 1000);
  const h = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const c = b64u(JSON.stringify({ iss: SA.client_email, scope: SCOPE, aud: SA.token_uri, iat: now, exp: now + 3600 }));
  const sig = crypto.sign('RSA-SHA256', Buffer.from(`${h}.${c}`), SA.private_key);
  const jwt = `${h}.${c}.${b64u(sig)}`;
  const r = await fetch(SA.token_uri, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }) });
  if (!r.ok) throw new Error(`token ${r.status}: ${await r.text()}`);
  return (await r.json()).access_token;
}

// high-intent head terms (by search volume intuition: temp/length/weight/volume)
const HEAD = [
  'celsius-to-fahrenheit','fahrenheit-to-celsius','km-to-mile','mile-to-km',
  'kg-to-pound','pound-to-kg','cm-to-inch','inch-to-cm','mb-to-mb',
  'gb-to-mb','mb-to-gb','gb-to-tb','liter-to-gallon','gallon-to-liter',
  'meter-to-feet','feet-to-meter','inch-to-mm','mm-to-inch','byte-to-mb',
  'cup-to-ml','ml-to-cup','ounce-to-gram','gram-to-ounce','fahrenheit-to-kelvin',
];

function extractUrls(xml) { const urls = []; const re = /<loc>([^<]+)<\/loc>/g; let m; while ((m = re.exec(xml)) !== null) urls.push(m[1]); return urls; }
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function publish(t, url) {
  const r = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
    method: 'POST', headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, type: 'URL_UPDATED' }),
  });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, url, body: j };
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limit = parseInt((args.find(a => a.startsWith('--limit=')) || `--limit=${QUOTA}`).slice(8), 10);

const all = extractUrls(fs.readFileSync(SITEMAP, 'utf8'));

// rank
const tier1 = all.filter(u => /^(https:\/\/unitbox\.online\/|\/en\/|\/zh-hans\/|\/zh-hant\/|\/zh-hans|\/zh-hant)$/.test(u.replace(SITE, '')) || u === `${SITE}/`);
const homes = [`${SITE}/`, `${SITE}/en/`, `${SITE}/zh-hans/`, `${SITE}/zh-hant/`].filter(u => all.includes(u));
const articles = all.filter(u => /\/articles\//.test(u));
const headUrls = [];
for (const term of HEAD) for (const loc of ['/en/', '/zh-hans/', '/zh-hant/']) { const u = `${SITE}${loc}${term}/`; if (all.includes(u)) headUrls.push(u); }
const rest = all.filter(u => !homes.includes(u) && !articles.includes(u) && !headUrls.includes(u));

// dedupe + ordered
const ranked = [...new Set([...homes, ...articles, ...headUrls, ...rest])].slice(0, limit);

console.error(`[prio-idx] sitemap=${all.length} homes=${homes.length} articles=${articles.length} head=${headUrls.length} → submitting top ${ranked.length}`);

if (dryRun) {
  ranked.forEach((u, i) => console.log(`${(i + 1).toString().padStart(3)}  ${u.replace(SITE, '')}`));
  process.exit(0);
}

const t = await getToken();
let ok = 0, fail = 0;
const failLog = [];
for (let i = 0; i < ranked.length; i++) {
  const r = await publish(t, ranked[i]);
  if (r.ok) ok++; else { fail++; failLog.push(r); }
  if ((i + 1) % 25 === 0) console.error(`[prio-idx]   ${i + 1}/${ranked.length} (ok=${ok} fail=${fail})`);
  await sleep(350); // Google Indexing API 429s above ~4/sec; 350ms ≈ 2.8/sec, ~110/min safe
}

const out = { date: new Date().toISOString(), submitted: ranked.length, ok, fail, tier_counts: { homes: homes.length, articles: articles.length, head: headUrls.length, rest: ranked.length - homes.length - articles.length - headUrls.length }, failures: failLog.slice(0, 10) };
fs.mkdirSync(OUT_DIR, { recursive: true });
const dateStr = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(OUT_DIR, dateStr, 'prioritized-indexing.json'), JSON.stringify(out, null, 2));
console.log(`[prio-idx] DONE · ok=${ok} fail=${fail} of ${ranked.length} · homes=${homes.length} articles=${articles.length} head=${headUrls.length}`);
if (fail) console.log(`[prio-idx] first failures:`, failLog.slice(0, 3).map(f => `${f.status} ${f.url.replace(SITE, '')}`));
