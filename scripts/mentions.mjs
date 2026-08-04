#!/usr/bin/env node
// scripts/mentions.mjs
// Social/external mentions of "unitbox" / unitbox.online across XHS/Reddit/X.
// Step 1.5 stub — returns empty snapshot. Will integrate webbridge/agent-reach later.
// Usage: node scripts/mentions.mjs --date 2026-08-01

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const today = new Date().toISOString().slice(0, 10);
const date = (args.find(a => a.startsWith('--date=')) || `--date=${today}`).slice(7);

const out = {
  date,
  fetch_ts: new Date().toISOString(),
  status: 'stub',
  note: 'Step 1.5 — integrate webbridge/agent-reach for XHS/Reddit/X mention scraping',
  mentions: [],
};

const outPath = path.join(ROOT, '.observe', date, 'mentions.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(`[mentions] stub · wrote ${outPath}`);