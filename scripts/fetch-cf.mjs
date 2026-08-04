#!/usr/bin/env node
// scripts/fetch-cf.mjs
// Cloudflare Zone Analytics fetcher. Zero deps.
// Two queries:
//   Q1. ZoneHttpRequests1dGroups  · exact daily totals (date only)
//   Q2. ZoneHttpRequestsOverviewAdaptiveGroups  · byCountry + byStatus (overview, no sample)
// byPath = NOT in 1dGroups; would need ZoneHttpRequestsAdaptiveGroups (sampled). Skipped for v1.
// Usage:
//   node scripts/fetch-cf.mjs --date 2026-08-01
//   node scripts/fetch-cf.mjs --verify
//
// Token: $CF_API_TOKEN or .cf/token
// Zone ID: $CF_ZONE_ID or .cf/zone-id

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CF_DIR = path.join(ROOT, '.cf');
const OUT_DIR = path.join(ROOT, '.observe');

const readFirst = (...paths) => {
  for (const p of paths) {
    if (!p) continue;
    if (p.startsWith('$')) {
      const v = process.env[p.slice(1)];
      if (v) return v.trim();
    } else if (fs.existsSync(p)) {
      return fs.readFileSync(p, 'utf8').trim();
    }
  }
  return null;
};

const TOKEN = readFirst('$CF_API_TOKEN', path.join(CF_DIR, 'token'), '$WRANGLER_API_TOKEN');
const ZONE_ID = readFirst('$CF_ZONE_ID', path.join(CF_DIR, 'zone-id'));

if (!TOKEN) { console.error('[cf] missing CF_API_TOKEN (env / .cf/token)'); process.exit(1); }

const HDR = { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

async function gql(query) {
  const r = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST', headers: HDR, body: JSON.stringify({ query }),
  });
  const j = await r.json();
  if (j.errors) throw new Error(`graphql: ${JSON.stringify(j.errors)}`);
  return j.data;
}

async function rest(method, url) {
  const r = await fetch(`https://api.cloudflare.com/client/v4${url}`, { method, headers: HDR });
  const j = await r.json();
  if (!r.ok || j.success === false) throw new Error(`${method} ${url} ${r.status}: ${JSON.stringify(j.errors || j)}`);
  return j.result;
}

async function getZoneId() {
  if (ZONE_ID) return ZONE_ID;
  const r = await rest('GET', '/zones?name=unitbox.online');
  if (!r.length) throw new Error('zone unitbox.online not found');
  return r[0].id;
}

const shiftDate = (iso, d) => { const x = new Date(iso); x.setUTCDate(x.getUTCDate() + d); return x.toISOString().slice(0, 10); };

async function main() {
  const args = process.argv.slice(2);
  const verify = args.includes('--verify');
  const today = new Date().toISOString().slice(0, 10);
  const date = (args.find(a => a.startsWith('--date=')) || `--date=${today}`).slice(7);

  const zoneId = await getZoneId();

  if (verify) {
    const z = await rest('GET', `/zones/${zoneId}`);
    console.log(`[cf] auth OK · zone=${z.name} id=${z.id} status=${z.status}`);
    return;
  }

  const start = shiftDate(date, -14);

  // Q1: exact daily totals (latest day)
  const q1 = `{
    viewer {
      zones(filter: { zoneTag: "${zoneId}" }) {
        totals: httpRequests1dGroups(limit: 1, filter: { date_geq: "${start}", date_lt: "${date}" }, orderBy: [date_DESC]) {
          dimensions { date }
          sum { requests bytes cachedBytes cachedRequests encryptedBytes encryptedRequests pageViews threats }
          uniq { uniques }
        }
      }
    }
  }`;
  const d1 = await gql(q1);
  const totalsRow = d1.viewer.zones[0].totals[0] || null;
  const totals = totalsRow?.sum || null;
  const latest = totalsRow?.dimensions?.date || null;

  // Q2: byCountry + byStatus (overview, free, exact). visits = unique sessions.
  const q2 = `{
    viewer {
      zones(filter: { zoneTag: "${zoneId}" }) {
        byCountry: httpRequestsOverviewAdaptiveGroups(limit: 20, filter: { date_geq: "${start}", date_lt: "${date}" }, orderBy: [sum_requests_DESC]) {
          dimensions { clientCountryName }
          sum { requests bytes visits }
        }
        byStatus: httpRequestsOverviewAdaptiveGroups(limit: 10, filter: { date_geq: "${start}", date_lt: "${date}" }, orderBy: [sum_requests_DESC]) {
          dimensions { edgeResponseStatus }
          sum { requests }
        }
      }
    }
  }`;
  const d2 = await gql(q2);
  const z2 = d2.viewer.zones[0];

  // Q3: latest-day path + host-port breakdown.
  // NOTE on bot/human: CF free-tier GraphQL has NO referer dimension and NO clean
  // bot/human split. requestSource="eyeball" means "client request" ≈ ALL traffic
  // (NOT human). The best human proxies are Q1's uniques (CF de-bots lightly)
  // and pageViews (HTML renders). threats = flagged bots/scanners. This query
  // stays within the 1-day max range of httpRequestsAdaptiveGroups and surfaces
  // what URLs + which host:ports got hit — port-scan bots show as non-:443 hosts.
  const dayStart = `${shiftDate(date, -1)}T00:00:00Z`;
  const dayEnd = `${date}T00:00:00Z`;
  const q3 = `{
    viewer {
      zones(filter: { zoneTag: "${zoneId}" }) {
        topPaths: httpRequestsAdaptiveGroups(limit: 20, filter: { datetime_gt: "${dayStart}", datetime_lt: "${dayEnd}" }, orderBy: [count_DESC]) { count dimensions { clientRequestPath } }
        topHostPorts: httpRequestsAdaptiveGroups(limit: 20, filter: { datetime_gt: "${dayStart}", datetime_lt: "${dayEnd}" }, orderBy: [count_DESC]) { count dimensions { clientRequestHTTPHost } }
      }
    }
  }`;
  let dayDetail = null;
  try {
    const d3 = await gql(q3);
    const z3 = d3.viewer.zones[0];
    dayDetail = {
      window: { start: dayStart, end: dayEnd },
      top_paths: (z3.topPaths || []).map(r => ({ path: r.dimensions.clientRequestPath, hits: r.count })),
      top_host_ports: (z3.topHostPorts || []).map(r => ({ host: r.dimensions.clientRequestHTTPHost, hits: r.count })),
    };
  } catch (e) { dayDetail = { error: e.message }; }

  const out = {
    date,
    fetch_ts: new Date().toISOString(),
    zone_id: zoneId,
    window: { start, end: date },
    totals: totals ? {
      date: latest,
      requests: totals.requests,
      bytes: totals.bytes,
      cached_bytes: totals.cachedBytes,
      cached_requests: totals.cachedRequests,
      encrypted_bytes: totals.encryptedBytes,
      encrypted_requests: totals.encryptedRequests,
      page_views: totals.pageViews,
      threats: totals.threats,
      uniques: totalsRow?.uniq?.uniques ?? 0,
    } : null,
    by_country: (z2.byCountry || []).map(r => ({ country: r.dimensions.clientCountryName, requests: r.sum.requests, bytes: r.sum.bytes, visits: r.sum.visits })),
    by_status: (z2.byStatus || []).map(r => ({ status: r.dimensions.edgeResponseStatus, requests: r.sum.requests })),
    day_detail: dayDetail,
    note: 'byPath skipped v1 (requires ZoneHttpRequestsAdaptiveGroups which is sampled). Add later if path breakdown needed.',
  };

  const outPath = path.join(OUT_DIR, date, 'cf.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`[cf] wrote ${outPath} · reqs=${out.totals?.requests || 0} uniques=${out.totals?.uniques || 0} pageViews=${out.totals?.page_views || 0} threats=${out.totals?.threats || 0} cached%=${out.totals ? Math.round(out.totals.cached_requests / out.totals.requests * 100) : 0} countries=${out.by_country.length} statuses=${out.by_status.length} dayPaths=${out.day_detail?.top_paths?.length ?? '?'}`);
}

main().catch(e => { console.error('[cf] FAIL:', e.message); process.exit(1); });
