#!/usr/bin/env node
// scripts/fetch-gsc.mjs
// Service-account GSC searchAnalytics fetcher. Hand-rolled JWT (zero deps).
// Usage:
//   node scripts/fetch-gsc.mjs --date 2026-08-01
//   node scripts/fetch-gsc.mjs --verify

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SA_PATH = path.join(ROOT, '.gsc/sa.json');
const SITE = 'https://unitbox.online';
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

if (!fs.existsSync(SA_PATH)) { console.error(`[gsc] missing SA at ${SA_PATH}`); process.exit(1); }
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

async function query(t, body) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`query ${r.status}: ${await r.text()}`);
  return r.json();
}

const shiftDate = (iso, d) => { const x = new Date(iso); x.setUTCDate(x.getUTCDate() + d); return x.toISOString().slice(0, 10); };

async function main() {
  const args = process.argv.slice(2);
  const verify = args.includes('--verify');
  const today = new Date().toISOString().slice(0, 10);
  const date = (args.find(a => a.startsWith('--date=')) || `--date=${today}`).slice(7);

  const t = await getToken();
  if (verify) {
    const r = await query(t, { startDate: date, endDate: date, dimensions: ['date'] });
    console.log(`[gsc] auth OK · site query OK · date=${date} rows=${r.rows?.length || 0}`);
    return;
  }

  const start = shiftDate(date, -14);
  const [totals, qry, pg, dev] = await Promise.all([
    query(t, { startDate: start, endDate: date, dimensions: ['date'] }),
    query(t, { startDate: start, endDate: date, dimensions: ['query'], rowLimit: 100 }),
    query(t, { startDate: start, endDate: date, dimensions: ['page'],  rowLimit: 100 }),
    query(t, { startDate: start, endDate: date, dimensions: ['device'] }),
  ]);

  const latest = (totals.rows || []).sort((a, b) => b.keys[0].localeCompare(a.keys[0]))[0] || null;
  const out = {
    date,
    fetch_ts: new Date().toISOString(),
    window: { start, end: date },
    totals: latest ? { date: latest.keys[0], clicks: latest.clicks, impressions: latest.impressions, ctr: latest.ctr, position: latest.position } : null,
    top_queries: qry.rows || [],
    top_pages: pg.rows || [],
    devices: dev.rows || [],
  };

  const outPath = path.join(ROOT, '.observe', date, 'gsc.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`[gsc] wrote ${outPath} · queries=${out.top_queries.length} pages=${out.top_pages.length} devices=${out.devices.length} totals=${out.totals ? 'yes' : 'null'}`);
}

main().catch(e => { console.error('[gsc] FAIL:', e.message); process.exit(1); });