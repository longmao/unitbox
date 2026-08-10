#!/usr/bin/env node
// scripts/submit-gsc-sitemap.mjs
// Submit sitemap-index.xml + sitemap-0.xml to Google Search Console (Webmasters API
// sitemaps.submit). Triggers Google to (re)fetch the sitemap — fixes last_submitted=null.
//
// Key difference from fetch-gsc-sitemaps.mjs: SA scope = `webmasters` (WRITE), not readonly.
// The service account already has the capability; scope is chosen at JWT sign time.
//
// Usage: node scripts/submit-gsc-sitemap.mjs
// SA: $GSC_SA_PATH or .gsc/sa.json   Site: https://unitbox.online

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SA_PATH = process.env.GSC_SA_PATH || path.join(ROOT, '.gsc', 'sa.json');
const SITE = 'https://unitbox.online';
const SCOPE = 'https://www.googleapis.com/auth/webmasters'; // WRITE scope
const FEEDS = [`${SITE}/sitemap-index.xml`, `${SITE}/sitemap-0.xml`];

if (!fs.existsSync(SA_PATH)) { console.error(`[gsc-submit] missing SA at ${SA_PATH}`); process.exit(1); }
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
  const t = await getToken();
  const siteEnc = encodeURIComponent(SITE);
  const results = [];
  for (const feed of FEEDS) {
    const feedEnc = encodeURIComponent(feed);
    const url = `https://www.googleapis.com/webmasters/v3/sites/${siteEnc}/sitemaps/${feedEnc}`;
    const r = await fetch(url, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${t}` },
      // GSC sitemaps.submit: feedUrl in path param is sufficient; body MUST be empty
      // (any field → 400 "Cannot find field"). Docs: PUT /sites/{site}/sitemaps/{feed}.
    });
    let body = '';
    try { body = await r.text(); } catch {}
    results.push({ feed, status: r.status, ok: r.ok, resp: r.ok ? '(submitted)' : body.slice(0, 240) });
    await new Promise(res => setTimeout(res, 400)); // pace
  }
  console.log(JSON.stringify({ site: SITE, submitted: results }, null, 2));
  const failed = results.filter(r => !r.ok);
  if (failed.length) { console.error(`[gsc-submit] ${failed.length}/${results.length} failed`); process.exit(1); }
  console.log(`[gsc-submit] OK · submitted ${results.length} sitemaps · Google will re-fetch within ~hours`);
}

main().catch(e => { console.error('[gsc-submit] FAIL:', e.message); process.exit(1); });
