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

// Query 战场（per 7-31 baseline llm-coverage-check）:
// unitbox 的 AI 可见度主战场 = 导航式 query（best/free/tool 类，AI 会列工具网站），
// 不是 transactional（convert X to Y，AI 直接给公式不列工具）。重导航式 + 1 对照。
const QUERIES = [
  'best unit converter online',
  'free online unit converter tool',
  'convert units tool',
  'celsius to fahrenheit converter',
  'convert 100 celsius to fahrenheit', // transactional 对照（AI 多半给公式）
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
  // retry once on transient fetch fail (network/限流), 2s backoff — Perplexity 偶发 fetch failed
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const r = await fetch(e.endpoint, { method: 'POST', headers: e.headers(k), body: JSON.stringify(e.buildBody(q)) });
      if (!r.ok) throw new Error(`${name} HTTP ${r.status}: ${await r.text()}`);
      return r.json();
    } catch (err) {
      if (attempt === 2) throw err;
      await new Promise(res => setTimeout(res, 2000));
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry-run');
  const today = new Date().toISOString().slice(0, 10);
  const date = (args.find(a => a.startsWith('--date=')) || `--date=${today}`).slice(7);

  const names = ['perplexity', 'openai', 'anthropic'];
  const engineArg = args.find(a => a.startsWith('--engine='));
  // --engine=X overrides the 3-day rotation (used by 8/12 checkpoint deep-check)
  const name = engineArg ? engineArg.slice(9) : names[new Date(date + 'T00:00:00Z').getUTCDay() % 3];
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