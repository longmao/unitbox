#!/usr/bin/env node
// scripts/fetch-bing-stats.mjs
// Bing Webmaster Tools URL-level crawl status. Zero deps.
// Rolling slice over the sitemap so all URLs get checked over ~2 weeks
// (SLICE_SIZE per run × 2 runs/day). Each run calls GetUrlInfo per URL and
// classifies: discovered / crawled / with-content (DocumentSize > 0).
//
// Why rolling: Bing WMT GetCrawlStats/GetPageStats/GetQueryStats return empty
// {"d":[]} for newly-added sites — only GetUrlInfo gives signal, and it is
// per-URL. 3424 URLs × every-run would hammer the API; a rotating slice gives
// full coverage every ~14 days at 2 runs/day without rate-limit risk.
//
// Usage:
//   node scripts/fetch-bing-stats.mjs --date 2026-08-03
//   node scripts/fetch-bing-stats.mjs --verify
//   node scripts/fetch-bing-stats.mjs --slice 200      # override slice size
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
const SITEMAP = path.join(ROOT, 'dist', 'sitemap-0.xml');
const MASTER = path.join(OUT_DIR, 'bing-url-master.jsonl');

const DEFAULT_SLICE = 120;          // per run → full coverage ≈ 14d @ 2/day
const DELAY_MS = 90;                 // polite pacing between GetUrlInfo calls
const DOTNET_MIN_EPOCH = -62135568000000; // .NET DateTime.MinValue (year 0001)

const KEY = (() => {
  if (process.env.BING_WMT_API_KEY) return process.env.BING_WMT_API_KEY.trim();
  const p = path.join(CF_DIR, 'bing-wmt-key');
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8').trim() : null;
})();
const SITE = (process.env.BING_WMT_SITE_URL || 'https://unitbox.online').replace(/\/$/, '');

if (!KEY) { console.error('[bing-stats] missing BING_WMT_API_KEY (env / .cf/bing-wmt-key)'); process.exit(1); }

const sleep = ms => new Promise(r => setTimeout(r, ms));

// /Date(1785654000000-0700)/  or  /Date(-62135568000000-0800)/  →  ms integer | null
function dotNetToMs(s) {
  if (typeof s !== 'string') return null;
  const m = s.match(/\/Date\((-?\d+)/);
  return m ? parseInt(m[1], 10) : null;
}
const isReal = ms => ms !== null && ms > DOTNET_MIN_EPOCH;

function extractUrlsFromSitemap(xml) {
  const urls = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) urls.push(m[1]);
  return urls;
}

// deterministic run index (no Math.random) — slice advances per RUN.
// Cron fires 2x/day (00:00 + 12:00 local); the hour disambiguates the two runs
// so each covers a different slice → full coverage in ceil(total/slice) runs.
function runIndex(dateIso) {
  // days since 2026-07-31 (site launch anchor)
  const anchor = Date.UTC(2026, 6, 31);
  const dayStart = Date.UTC(+dateIso.slice(0, 4), +dateIso.slice(5, 7) - 1, +dateIso.slice(8, 10));
  const dayIdx = Math.max(0, Math.floor((dayStart - anchor) / 86400000));
  // second run of the day if launched at/after noon local
  const half = new Date().getHours() >= 12 ? 1 : 0;
  return dayIdx * 2 + half;
}

function localeOf(url) {
  const u = url.replace(SITE, '');
  if (u.startsWith('/en/') || u === '/en') return 'en';
  if (u.startsWith('/zh-hans/') || u === '/zh-hans') return 'zh-hans';
  if (u.startsWith('/zh-hant/') || u === '/zh-hant') return 'zh-hant';
  return 'root';
}

async function getUrlInfo(url) {
  const api = `https://ssl.bing.com/webmaster/api.svc/json/GetUrlInfo?siteUrl=${encodeURIComponent(SITE)}&apikey=${encodeURIComponent(KEY)}&url=${encodeURIComponent(url)}`;
  const r = await fetch(api);
  const j = await r.json().catch(() => ({}));
  const d = j.d;
  if (!d || d.__type) {
    // __type present = valid response object (even if undiscovered)
    return {
      url,
      discovered_ms: dotNetToMs(d?.DiscoveryDate),
      crawled_ms: dotNetToMs(d?.LastCrawledDate),
      doc_size: d?.DocumentSize ?? 0,
      http_status: d?.HttpStatus ?? 0,
      anchor_count: d?.AnchorCount ?? 0,
    };
  }
  return { url, error: j.ErrorCode ? `${j.ErrorCode}: ${j.message || ''}` : `HTTP ${r.status}` };
}

async function main() {
  const args = process.argv.slice(2);
  const verify = args.includes('--verify');
  const today = new Date().toISOString().slice(0, 10);
  const date = (args.find(a => a.startsWith('--date=')) || `--date=${today}`).slice(7);
  const sliceSize = parseInt((args.find(a => a.startsWith('--slice=')) || `--slice=${DEFAULT_SLICE}`).slice(8), 10);

  if (verify) {
    const r = await getUrlInfo(`${SITE}/`);
    console.log(`[bing-stats] auth OK · GetUrlInfo OK · root discovered=${isReal(r.discovered_ms)} crawled=${isReal(r.crawled_ms)} docsize=${r.doc_size}`);
    return;
  }

  if (!fs.existsSync(SITEMAP)) { console.error(`[bing-stats] missing sitemap at ${SITEMAP}`); process.exit(1); }
  const allUrls = extractUrlsFromSitemap(fs.readFileSync(SITEMAP, 'utf8'));
  const total = allUrls.length;

  // rolling window: each run covers a contiguous slice that advances per RUN
  const ri = runIndex(date);
  const start = (ri * sliceSize) % total;
  const idxs = [];
  for (let k = 0; k < sliceSize; k++) idxs.push((start + k) % total);
  const slice = idxs.map(i => allUrls[i]);

  console.error(`[bing-stats] date=${date} total=${total} slice[${start}..${(start + sliceSize - 1) % total}] size=${sliceSize}`);

  const results = [];
  for (let i = 0; i < slice.length; i++) {
    const r = await getUrlInfo(slice[i]);
    results.push(r);
    if ((i + 1) % 20 === 0) console.error(`[bing-stats]   ${i + 1}/${slice.length}`);
    if (DELAY_MS) await sleep(DELAY_MS);
  }

  // aggregate
  const agg = { discovered: 0, crawled: 0, with_content: 0, errors: 0 };
  const byLocale = { en: { n: 0, discovered: 0, crawled: 0, with_content: 0 },
                     'zh-hans': { n: 0, discovered: 0, crawled: 0, with_content: 0 },
                     'zh-hant': { n: 0, discovered: 0, crawled: 0, with_content: 0 },
                     root: { n: 0, discovered: 0, crawled: 0, with_content: 0 } };
  const crawledRecently = []; // urls crawled in last 7d

  const nowMs = Date.now();
  const sevenD = 7 * 86400 * 1000;

  for (const r of results) {
    if (r.error) { agg.errors++; continue; }
    const loc = localeOf(r.url);
    byLocale[loc].n++;
    const disc = isReal(r.discovered_ms);
    const craw = isReal(r.crawled_ms);
    const content = (r.doc_size ?? 0) > 0;
    if (disc) { agg.discovered++; byLocale[loc].discovered++; }
    if (craw) { agg.crawled++; byLocale[loc].crawled++; }
    if (content) { agg.with_content++; byLocale[loc].with_content++; }
    if (craw && (nowMs - r.crawled_ms) < sevenD) crawledRecently.push({ url: r.url, crawled: new Date(r.crawled_ms).toISOString() });
  }

  const out = {
    date,
    fetch_ts: new Date().toISOString(),
    site: SITE,
    sitemap_total: total,
    slice: { size: sliceSize, start_index: start, end_index: (start + sliceSize - 1) % total,
             run_index: ri,
             full_coverage_runs: Math.ceil(total / sliceSize),
             full_coverage_days: Math.ceil(Math.ceil(total / sliceSize) / 2) },
    summary: { ...agg, sample_size: results.length },
    by_locale: byLocale,
    crawled_last_7d: crawledRecently.sort((a, b) => b.crawled.localeCompare(a.crawled)),
  };

  const outPath = path.join(OUT_DIR, date, 'bing-stats.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));

  // append per-URL records to master jsonl for trend (one line per URL per run)
  const masterLines = results.filter(r => !r.error).map(r =>
    JSON.stringify({ date, url: r.url, loc: localeOf(r.url),
      discovered: isReal(r.discovered_ms), crawled: isReal(r.crawled_ms),
      crawled_at: isReal(r.crawled_ms) ? new Date(r.crawled_ms).toISOString() : null,
      doc_size: r.doc_size ?? 0 }));
  fs.appendFileSync(MASTER, masterLines.join('\n') + (masterLines.length ? '\n' : ''));

  const pct = (x, n) => n ? Math.round((x / n) * 100) : 0;
  console.log(`[bing-stats] wrote ${outPath} · sample=${agg.discovered + agg.crawled + agg.with_content + agg.errors}/${results.length} disc=${agg.discovered}(${pct(agg.discovered, results.length)}%) crawl=${agg.crawled}(${pct(agg.crawled, results.length)}%) content=${agg.with_content} err=${agg.errors} · master+${masterLines.length}`);
}

main().catch(e => { console.error('[bing-stats] FAIL:', e.message); process.exit(1); });
