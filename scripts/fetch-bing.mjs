#!/usr/bin/env node
// scripts/fetch-bing.mjs
// Bing Webmaster Tools URL Submission API publisher. Zero deps.
// Pushes sitemap URLs to Bing for immediate crawl (covers Bing + Yahoo).
// Quota: 10,000 URLs/month (free).
// Usage:
//   node scripts/fetch-bing.mjs --sitemap dist/sitemap-0.xml --limit 100
//   node scripts/fetch-bing.mjs --url https://unitbox.online/
//   node scripts/fetch-bing.mjs --verify
//
// Key: $BING_WMT_API_KEY or .cf/bing-wmt-key
// Site: $BING_WMT_SITE_URL or default https://unitbox.online

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CF_DIR = path.join(ROOT, '.cf');
const OUT_DIR = path.join(ROOT, '.observe');

const KEY = (() => {
  if (process.env.BING_WMT_API_KEY) return process.env.BING_WMT_API_KEY.trim();
  const p = path.join(CF_DIR, 'bing-wmt-key');
  if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8').trim();
  return null;
})();

const SITE = (process.env.BING_WMT_SITE_URL || 'https://unitbox.online').replace(/\/$/, '');

if (!KEY) {
  console.error('[bing] missing BING_WMT_API_KEY (env / .cf/bing-wmt-key)');
  console.error('       Get key: https://www.bing.com/webmasters → Settings → API Access');
  process.exit(1);
}

const ENDPOINT = `https://api.bing.com/urls/Submit?apikey=${encodeURIComponent(KEY)}`;

function extractUrlsFromSitemap(xml, limit) {
  const urls = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    urls.push(m[1]);
    if (urls.length >= limit) break;
  }
  return urls;
}

async function submit(urls) {
  const r = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ siteUrl: SITE, urlList: urls }),
  });
  const text = await r.text();
  return { ok: r.ok, status: r.status, body: text };
}

async function main() {
  const args = process.argv.slice(2);
  const verify = args.includes('--verify');
  const limit = parseInt((args.find(a => a.startsWith('--limit=')) || '--limit=100').slice(8), 10);
  const sitemapArg = args.find(a => a.startsWith('--sitemap='));
  const urlArg = args.find(a => a.startsWith('--url='));

  if (verify) {
    // Submit 1 known URL as auth probe
    const r = await submit([SITE + '/en/']);
    console.log(`[bing] auth probe · status=${r.status} body=${r.body.slice(0, 200)}`);
    console.log(`[bing] auth ${r.ok ? 'OK' : 'FAIL'}`);
    return;
  }

  let urls = [];
  if (urlArg) {
    urls = [urlArg.slice(6)];
  } else {
    const sitemapPath = sitemapArg ? path.resolve(ROOT, sitemapArg.slice(10)) : path.join(ROOT, 'dist/sitemap-0.xml');
    if (!fs.existsSync(sitemapPath)) {
      console.error('[bing] sitemap not found:', sitemapPath);
      process.exit(1);
    }
    urls = extractUrlsFromSitemap(fs.readFileSync(sitemapPath, 'utf8'), limit);
  }

  console.log(`[bing] submitting ${urls.length} URLs to ${SITE} (quota: 10000/month) ...`);

  // Bing URL Submission API accepts up to 500 URLs per request body
  const BATCH = 500;
  const allResults = [];
  for (let i = 0; i < urls.length; i += BATCH) {
    const batch = urls.slice(i, i + BATCH);
    try {
      const r = await submit(batch);
      allResults.push({ range: [i, i + batch.length], status: r.status, ok: r.ok, body: r.body });
      console.log(`  [${i + 1}-${i + batch.length}] ${r.ok ? 'OK' : 'FAIL'} ${r.status} ${r.body.slice(0, 100)}`);
    } catch (e) {
      allResults.push({ range: [i, i + batch.length], ok: false, error: e.message });
      console.error(`  [${i + 1}-${i + batch.length}] ERROR: ${e.message}`);
    }
  }

  const okCount = allResults.filter(r => r.ok).length;
  const totalUrls = allResults.reduce((s, r) => s + (r.range[1] - r.range[0]), 0);
  console.log(`\n[bing] DONE · OK=${okCount}/${allResults.length} batches · ${totalUrls} URLs total`);

  // Save log
  const date = new Date().toISOString().slice(0, 10);
  const logPath = path.join(OUT_DIR, date, 'bing-submit.json');
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.writeFileSync(logPath, JSON.stringify({
    date,
    fetch_ts: new Date().toISOString(),
    site: SITE,
    total: totalUrls,
    batches: allResults.length,
    ok: okCount,
    results: allResults,
  }, null, 2));
  console.log(`[bing] log: ${logPath}`);
}

main().catch(e => { console.error('[bing] FAIL:', e.message); process.exit(1); });
