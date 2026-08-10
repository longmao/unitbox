// /robots.txt — generated from the configured site origin (no hard-coded URL).
// Allow all crawlers + explicit AI bot whitelist (per 7/30 trust signal strategy).
//   2026-08-05: explicit Allow 对检索型 AI bot，是比 `User-agent:*` 默认放行更强的邀请信号。
//   注意：Cloudflare bot_management 的 is_robots_txt_managed 若被重新开启，会在边缘覆盖本文件
//   注入 `# BEGIN Cloudflare Managed content` 全 Disallow——由 verify-robots-aibots.mjs 监控。
import type { APIRoute } from 'astro';
import { SITE } from '~/lib/site';

export const prerender = true;

// 检索型 AI bot 显式白名单：ChatGPT/Claude/Gemini/Perplexity/Apple/Cohere/DuckDuckGo/Bedrock
const AI_BOTS = [
  'GPTBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-Web', 'anthropic-ai',
  'Google-Extended',
  'PerplexityBot', 'Perplexity',
  'CCBot',
  'Applebot-Extended',
  'cohere-ai',
  'DuckAssistBot',
  'AmazonBedrock',
];

export const GET: APIRoute = () => {
  const lines = [
    '# unitbox.online · robots.txt',
    '# Allow all crawlers + explicit AI bot whitelist (per 7/30 trust signal strategy)',
    '',
    'User-agent: *',
    'Allow: /',
    'Disallow: /_astro/',
    'Disallow: /404.html',
    '',
    '# ── AI crawlers (explicit whitelist, all access) ──',
    ...AI_BOTS.flatMap((b) => [`User-agent: ${b}`, 'Allow: /', '']),
    `Sitemap: ${SITE.url}/sitemap-index.xml`,
    '',
  ];
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};