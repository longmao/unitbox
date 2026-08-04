#!/usr/bin/env node
// scripts/pages-deploy.mjs
// CF Pages Direct Upload API deploy (bypass wrangler OAuth).
// Token: .cf/api-key (cfk_ global) via X-Auth-Email + X-Auth-Key
// Usage: node scripts/pages-deploy.mjs

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const CF_DIR = path.join(ROOT, '.cf');

const KEY = fs.readFileSync(path.join(CF_DIR, 'api-key'), 'utf8').trim();
const EMAIL = 'unclelongmao@gmail.com';
const ACCOUNT_ID = '351c7be49e1c8eaf2d53471ebb541c2b';
const PROJECT = 'unitbox';

const HDR = { 'X-Auth-Email': EMAIL, 'X-Auth-Key': KEY, 'Content-Type': 'application/json' };

function listFiles(dir, base = '') {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      out.push(...listFiles(full, rel));
    } else if (entry.isFile()) {
      const stat = fs.statSync(full);
      if (stat.size === 0) continue;
      out.push({ path: rel, size: stat.size });
    }
  }
  return out;
}

function hashFile(filepath) {
  const content = fs.readFileSync(filepath);
  // CF Pages expects base64url SHA-256 hash of file content
  return crypto.createHash('sha256').update(content).digest('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function api(method, url, body) {
  const r = await fetch(`https://api.cloudflare.com/client/v4${url}`, {
    method, headers: HDR, body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json();
  if (!r.ok || j.success === false) {
    console.error(`[api] ${method} ${url} ${r.status}:`, JSON.stringify(j.errors || j, null, 2).slice(0, 500));
    process.exit(1);
  }
  return j.result;
}

async function main() {
  console.log('[deploy] walking dist/ ...');
  const files = listFiles(DIST);
  console.log(`[deploy] found ${files.length} files`);

  console.log('[deploy] hashing files for manifest ...');
  const manifest = {};
  for (const f of files) {
    const hash = hashFile(path.join(DIST, f.path));
    manifest[`/${f.path}`] = hash;
  }

  console.log('[deploy] creating deployment ...');
  const dep = await api('POST', `/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT}/deployments`, { manifest });
  console.log(`[deploy] deployment id: ${dep.id}`);
  console.log(`[deploy] upload_url: ${dep.upload_url ? 'present' : 'MISSING'}`);

  if (dep.missing && dep.missing.length > 0) {
    console.log(`[deploy] need to upload ${dep.missing.length} new files`);
    let uploaded = 0;
    for (const rel of dep.missing) {
      const local = rel.replace(/^\//, '');
      const filepath = path.join(DIST, local);
      const content = fs.readFileSync(filepath);
      const url = `${dep.upload_url}/${rel}`;
      const r = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/octet-stream' }, body: content });
      if (!r.ok) {
        console.error(`[upload] ${rel} -> ${r.status}`);
        process.exit(1);
      }
      uploaded++;
      if (uploaded % 100 === 0) console.log(`  uploaded ${uploaded}/${dep.missing.length}`);
    }
    console.log(`[deploy] uploaded ${uploaded} files`);
  } else {
    console.log('[deploy] no files to upload (all already deployed)');
  }

  // Get current deployment info
  const deployments = await api('GET', `/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT}/deployments`);
  console.log(`[deploy] project has ${deployments.length} deployments, latest:`, deployments[0]?.id);
  console.log('[deploy] done!');
}

main().catch(e => { console.error('[deploy] FAIL:', e.message); process.exit(1); });
