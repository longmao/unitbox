#!/usr/bin/env node
// scripts/fetch-gsc-sitemaps.mjs
// GSC Sitemaps endpoint: submitted vs indexed URL count. Zero deps, hand-rolled JWT.
// This is the "is Google indexing us yet?" signal — searchAnalytics only shows pages
// with impressions; the sitemaps endpoint reports how many of the submitted URLs
// Google has actually indexed. Track the 0→N inflection point over time.
//
// Usage:
//   node scripts/fetch-gsc-sitemaps.mjs --date 2026-08-03
//   node scripts/fetch-gsc-sitemaps.mjs --verify
//
// SA: $GSC_SA_PATH or .gsc/sa.json   Site: https://unitbox.online

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SA_PATH = process.env.GSC_SA_PATH || path.join(ROOT, '.gsc', 'sa.json');
const OUT_DIR = path.join(ROOT, '.observe');
const MASTER = path.join(OUT_DIR, 'gsc-sitemaps-master.jsonl');
const SITE = 'https://unitbox.online';
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

if (!fs.existsSync(SA_PATH)) { console.error(`[gsc-sm] missing SA at ${SA_PATH}`); process.exit(1); }
const SA = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));

const b64u = b => Buffer.from(b).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

async function getToken() {
  const now = Math.floor(Date.now() / 1000);
  const h = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const c = b64u(JSON.stringify({ iss: SA.client_email, scope: SCOPE, aud: SA.token_uri, iat: now, exp: now + 3600 }));
  const sig = crypto.sign('RSA-SHA256', Buffer.from(`${h}.${c}`), SA.private_key);
  const jwt = `${h}.${c}.${b64u(sig)}`;
  const r = await fetch(SA.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  if (!r.ok) throw new Error(`token ${r.status}: ${await r.text()}`);
  return (await r.json()).access_token;
}

async function main() {
  const args = process.argv.slice(2);
  const verify = args.includes('--verify');
  const today = new Date().toISOString().slice(0, 10);
  const date = (args.find(a => a.startsWith('--date=')) || `--date=${today}`).slice(7);

  const t = await getToken();
  const r = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/sitemaps`, {
    headers: { Authorization: `Bearer ${t}` },
  });
  if (!r.ok) throw new Error(`sitemaps ${r.status}: ${await r.text()}`);
  const j = await r.json();
  const sms = j.sitemap || [];

  if (verify) {
    const c = sms[0]?.contents?.[0];
    console.log(`[gsc-sm] auth OK · sitemaps=${sms.length} submitted=${c?.submitted ?? '?'} indexed=${c?.indexed ?? '?'}`);
    return;
  }

  const parsed = sms.map(s => ({
    path: s.path,
    last_downloaded: s.lastDownloaded || null,
    last_submitted: s.submitted || null,
    errors: s.errors || 0,
    warnings: s.warnings || 0,
    contents: (s.contents || []).map(c => ({ type: c.type, submitted: c.submitted, indexed: c.indexed })),
  }));

  // aggregate across sitemaps (dedupe by max, since index + child overlap)
  let totalSubmitted = 0, totalIndexed = 0;
  for (const s of parsed) for (const c of s.contents) {
    if (c.type === 'web') {
      totalSubmitted = Math.max(totalSubmitted, +c.submitted || 0);
      totalIndexed = Math.max(totalIndexed, +c.indexed || 0);
    }
  }

  const out = {
    date,
    fetch_ts: new Date().toISOString(),
    site: SITE,
    sitemaps: parsed,
    summary: { submitted: totalSubmitted, indexed: totalIndexed, indexed_pct: totalSubmitted ? Math.round(totalIndexed / totalSubmitted * 1000) / 10 : 0 },
  };

  const outPath = path.join(OUT_DIR, date, 'gsc-sitemaps.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));

  // append one trend line per run
  fs.appendFileSync(MASTER, JSON.stringify({ date, submitted: totalSubmitted, indexed: totalIndexed, indexed_pct: out.summary.indexed_pct, sitemaps: parsed.length }) + '\n');

  console.log(`[gsc-sm] wrote ${outPath} · submitted=${totalSubmitted} indexed=${totalIndexed} (${out.summary.indexed_pct}%) sitemaps=${parsed.length} · master+1`);
}

main().catch(e => { console.error('[gsc-sm] FAIL:', e.message); process.exit(1); });
