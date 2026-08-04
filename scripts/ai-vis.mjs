#!/usr/bin/env node
// scripts/ai-vis.mjs
// AI visibility check: ask one engine per day "How do I convert X to Y?" and
// check if unitbox.online is cited. 3-day rotation covers Perplexity/OpenAI/Claude.
// Usage:
//   node scripts/ai-vis.mjs --date 2026-08-01
//   node scripts/ai-vis.mjs --dry-run

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const QUERIES = [
  'convert 100 celsius to fahrenheit',
  'how many feet in a meter',
  'convert 1 mile to kilometers',
  '30 mpg to liters per 100km',
  'how many bytes in a gigabyte',
];

const ENGINES = {
  perplexity: {
    endpoint: 'https://api.perplexity.ai/chat/completions',
    buildBody: (q) => ({ model: 'sonar', messages: [{ role: 'user', content: q }], search_recency_filter: 'month' }),
    extractText: (j) => j.choices?.[0]?.message?.content || '',
    extractCitations: (j) => j.citations || [],
    key: () => process.env.PERPLEXITY_API_KEY,
    headers: (k) => ({ 'Authorization': `Bearer ${k}`, 'Content-Type': 'application/json' }),
  },
  openai: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    buildBody: (q) => ({ model: 'gpt-4o-search-preview', messages: [{ role: 'user', content: q }] }),
    extractText: (j) => j.choices?.[0]?.message?.content || '',
    extractCitations: (j) => j.choices?.[0]?.message?.annotations || [],
    key: () => process.env.OPENAI_API_KEY,
    headers: (k) => ({ 'Authorization': `Bearer ${k}`, 'Content-Type': 'application/json' }),
  },
  anthropic: {
    endpoint: 'https://api.anthropic.com/v1/messages',
    buildBody: (q) => ({ model: 'claude-3-5-sonnet-latest', max_tokens: 1024, messages: [{ role: 'user', content: q }] }),
    extractText: (j) => j.content?.[0]?.text || '',
    extractCitations: (j) => [],
    key: () => process.env.ANTHROPIC_API_KEY,
    headers: (k) => ({ 'x-api-key': k, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' }),
  },
};

const DOMAIN = 'unitbox.online';

function cited(blob) { return typeof blob === 'string' && blob.includes(DOMAIN); }

async function call(name, q) {
  const e = ENGINES[name];
  const k = e.key();
  if (!k) throw new Error(`${name}: API key missing in env (${name.toUpperCase()}_API_KEY)`);
  const r = await fetch(e.endpoint, { method: 'POST', headers: e.headers(k), body: JSON.stringify(e.buildBody(q)) });
  if (!r.ok) throw new Error(`${name} HTTP ${r.status}: ${await r.text()}`);
  return r.json();
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry-run');
  const today = new Date().toISOString().slice(0, 10);
  const date = (args.find(a => a.startsWith('--date=')) || `--date=${today}`).slice(7);

  const dayIdx = new Date(date + 'T00:00:00Z').getUTCDay() % 3;
  const names = ['perplexity', 'openai', 'anthropic'];
  const name = names[dayIdx];
  const eng = ENGINES[name];
  const hasKey = !!eng.key();

  if (dry) {
    console.log(`[ai-vis] dry-run · date=${date} engine=${name} key=${hasKey ? 'yes' : 'NO'} queries=${QUERIES.length}`);
    return;
  }
  if (!hasKey) {
    const stub = {
      date, engine: name, status: 'no-key',
      note: `${name.toUpperCase()}_API_KEY missing — set env var to enable`,
      queries: [],
    };
    const outPath = path.join(ROOT, '.observe', date, 'ai-vis.json');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(stub, null, 2));
    console.log(`[ai-vis] skipped (no ${name.toUpperCase()}_API_KEY) · wrote stub ${outPath}`);
    return;
  }

  const results = [];
  for (const q of QUERIES) {
    try {
      const j = await call(name, q);
      const text = eng.extractText(j);
      const cites = eng.extractCitations(j);
      const hit = cited(text) || cites.some(c => JSON.stringify(c).includes(DOMAIN));
      const snippet = hit ? (cites.find(c => JSON.stringify(c).includes(DOMAIN)) || text.slice(0, 240)) : null;
      results.push({ date, engine: name, query: q, cited: hit, snippet: typeof snippet === 'string' ? snippet : JSON.stringify(snippet).slice(0, 240) });
      console.log(`[ai-vis] ${name} "${q.slice(0, 40)}..." → cited=${hit}`);
    } catch (e) {
      results.push({ date, engine: name, query: q, cited: false, error: e.message });
      console.error(`[ai-vis] ${name} "${q}" → ERROR: ${e.message}`);
    }
  }

  const outPath = path.join(ROOT, '.observe', date, 'ai-vis.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  const hits = results.filter(r => r.cited).length;
  console.log(`[ai-vis] wrote ${outPath} · cited=${hits}/${results.length}`);
}

main().catch(e => { console.error('[ai-vis] FAIL:', e.message); process.exit(1); });