// verify-robots-aibots.mjs
// 验证 unitbox.online/robots.txt 是否被 Cloudflare "AI Scrapers and Crawlers"
// 托管规则封印（BEGIN Cloudflare Managed content 块 → 全 AI bot Disallow）。
//
// 用途：
//   1. 解封前基线（证明封印存在）
//   2. 杨总 dashboard 关 toggle 后验证（证明解封）
//   3. cron 持续监控（防止 CF 重新开启 / 回归）
//
// Zero-dep (node 18+ global fetch)。输出 JSON 到 stdout（cron 友好）+ 人读摘要到 stderr。
//
// 背景：源站 public/robots.txt 明确 Allow 所有 AI bot（per 7/30 trust signal strategy），
// 但 Cloudflare Free zone 开了 "AI Scrapers and Crawlers" toggle 后，会在边缘把 robots.txt
// 覆盖成 # BEGIN Cloudflare Managed content 块，全量 Disallow GPTBot/ClaudeBot/Google-Extended/
// CCBot/PerplexityBot 等 → AI 引擎一个都进不来 → AI 可见度 0/15 的真因。
// 来源(2025-2026 多源实证)：Reddit r/CloudFlare、BrandAxis、Gecko Studio、NYTR SEO。

const URL = process.argv[2] || 'https://unitbox.online/robots.txt';

// 这些是 unitbox 源站 public/robots.txt 明确 Allow 的检索型 AI bot（要 AI 流量就要它们进得来）。
const WANTED_AI_BOTS = [
  'GPTBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-Web', 'anthropic-ai',
  'PerplexityBot', 'Perplexity', 'Google-Extended', 'CCBot',
  'Applebot-Extended', 'cohere-ai', 'DuckAssistBot', 'AmazonBedrock',
];

const res = await fetch(URL, { cache: 'no-store' });
const body = await res.text();
const cfManaged = body.includes('BEGIN Cloudflare Managed');
const contentSignal = (body.match(/Content-Signal:\s*(.+)/) || [])[1]?.trim();

// 解析被 Disallow 的 AI bot
const disallowed = [];
const lines = body.split('\n');
let curUA = null;
for (const ln of lines) {
  const m = ln.match(/^User-agent:\s*(.+)/i);
  if (m) curUA = m[1].trim();
  if (/^Disallow:\s*\/\s*$/.test(ln) && curUA) disallowed.push(curUA);
}
const disallowedAi = disallowed.filter(ua =>
  WANTED_AI_BOTS.some(w => ua.toLowerCase() === w.toLowerCase())
);

const blocked = cfManaged && disallowedAi.length > 0;

const out = {
  url: URL,
  http: res.status,
  cf_managed_block: cfManaged,
  content_signal: contentSignal || null,
  disallowed_ai_bots: disallowedAi,
  disallowed_ai_count: disallowedAi.length,
  wanted_ai_bots: WANTED_AI_BOTS.length,
  blocked: blocked,                    // true = AI bot 仍被封印
  verdict: blocked
    ? `🚫 BLOCKED — Cloudflare managed robots 封印 ${disallowedAi.length}/${WANTED_AI_BOTS.length} 个检索型 AI bot（AI 可见度归零的 root cause）`
    : (cfManaged
        ? `⚠️  CF managed 块仍在但未封 AI bot — 复检 Content-Signal`
        : `✅ UNBLOCKED — robots.txt 无 Cloudflare managed 封印，AI bot 可抓取`),
};

console.log(JSON.stringify(out, null, 2));
process.exit(blocked ? 1 : 0);  // 封印中 → exit 1，方便 cron/CI 告警
