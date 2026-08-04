#!/usr/bin/env node
// scripts/diff.mjs
// Compare today's snapshot vs yesterday's, emit diff.json
// Usage:
//   node scripts/diff.mjs --today=DIR --yesterday=DIR

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

function loadStatusTsv(p) {
  const out = {};
  if (!fs.existsSync(p)) return out;
  for (const line of fs.readFileSync(p, 'utf8').split('\n').filter(Boolean)) {
    const [code, url] = line.split('\t');
    const k = url.replace('https://unitbox.online', '');
    out[k] = parseInt(code, 10);
  }
  return out;
}

function loadSnapshot(dir) {
  if (!dir || !fs.existsSync(dir)) return null;
  return {
    endpoints: loadStatusTsv(path.join(dir, 'status.tsv')),
    gsc: loadJson(path.join(dir, 'gsc.json')),
    ai_vis: loadJson(path.join(dir, 'ai-vis.json')),
  };
}

function pct(curr, prev) {
  if (prev === 0) return curr > 0 ? '+inf' : '0%';
  return `${(((curr - prev) / prev) * 100).toFixed(1)}%`;
}

const args = process.argv.slice(2);
const todayDir = args.find(a => a.startsWith('--today='))?.slice(7);
const yestDir = args.find(a => a.startsWith('--yesterday='))?.slice(11);
if (!todayDir) { console.error('usage: --today=DIR --yesterday=DIR'); process.exit(1); }

const today = loadSnapshot(todayDir);
const yest = yestDir ? loadSnapshot(yestDir) : null;
const date = path.basename(todayDir);

const diff = { date, ts: new Date().toISOString(), has_yesterday: !!yest };

// endpoints
if (today?.endpoints) {
  diff.endpoints = {};
  for (const [p, code] of Object.entries(today.endpoints)) {
    const prev = yest?.endpoints?.[p];
    diff.endpoints[p] = { status: code, prev_status: prev ?? null, changed: prev != null && prev !== code };
  }
}

// gsc
if (today?.gsc?.totals) {
  const t = today.gsc.totals;
  const p = yest?.gsc?.totals;
  diff.gsc = {
    date: t.date,
    clicks: { curr: t.clicks, prev: p?.clicks ?? null, delta_pct: p ? pct(t.clicks, p.clicks) : null },
    impressions: { curr: t.impressions, prev: p?.impressions ?? null, delta_pct: p ? pct(t.impressions, p.impressions) : null },
    ctr: { curr: t.ctr, prev: p?.ctr ?? null, delta_pct: p ? pct(t.ctr, p.ctr) : null },
    position: { curr: t.position, prev: p?.position ?? null, delta: p ? (t.position - p.position).toFixed(2) : null },
  };
}

// ai-vis
if (today?.ai_vis) {
  const tCited = today.ai_vis.filter(r => r.cited).length;
  const yCited = yest?.ai_vis ? yest.ai_vis.filter(r => r.cited).length : null;
  diff.ai_vis = {
    engine: today.ai_vis[0]?.engine,
    cited_count: tCited,
    cited_count_prev: yCited,
    cited_delta: yCited != null ? tCited - yCited : null,
    queries: today.ai_vis.map(r => ({ q: r.query, cited: r.cited, error: r.error || null })),
  };
}

console.log(JSON.stringify(diff, null, 2));