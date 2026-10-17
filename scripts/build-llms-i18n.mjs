// One-time script: translate llms.en.txt to llms.zh-hant.txt and llms.zh-hans.txt
// using opencc-js. Run after llms.en.txt is updated.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as OpenCC from 'opencc-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'public/llms.en.txt');

const toHant = OpenCC.Converter({ from: 'cn', to: 'tw' });
const toHans = OpenCC.Converter({ from: 'tw', to: 'cn' });

const en = fs.readFileSync(SRC, 'utf8');

// We do NOT translate URLs or technical tokens. Convert only Chinese-friendly
// content. Since the source is English, opencc-js cn→tw will produce the same
// English (no-op). To get Chinese versions, we need to translate from English
// to Chinese first — which opencc doesn't do. So we need a different approach:
// - For zh-hans: translate EN → ZH-HANS using a prewritten Chinese version
// - For zh-hant: convert zh-hans → zh-hant
//
// For simplicity (and because the per-locale docs are mostly URL tables and
// short section headers), we ship a manually-written `llms.zh-hans.txt` and
// derive `llms.zh-hant.txt` from it via opencc. This keeps the Chinese content
// in natural Chinese rather than mechanical translation.

const manualZhHans = en
  // Replace English chunk by chunk with Chinese equivalents
  .replace(/^# unitbox$/m, '# unitbox')
  .replace(/^> unitbox is a free, open, offline-first unit conversion network\.[\s\S]*?no backend roundtrip\.$/m,
    '> unitbox 是一个免费、开源、离线优先的单位换算网络。涵盖 12 个分类（长度、质量、温度、面积、体积、速度、时间、数据、能量、压力、角度、油耗）共 111 个单位、1016 个预计算换算对页、一个通用计算器，以及结构丰富的 JSON-LD 知识图谱。所有页面均静态生成；换算器在客户端运行，无需后端往返。')
  .replace(/^This document is for AI assistants, search crawlers, and integration partners\. The human-readable companion is at https:\/\/unitbox\.online\/en\/llms\.$/m,
    '本文档面向 AI 助手、搜索引擎爬虫与集成合作伙伴。人类可读的对等页面见 https://unitbox.online/zh-hans/llms。')
  .replace(/^## What unitbox Does \(for an AI trying to answer user questions\)$/m, '## unitbox 能做什么（面向回答用户问题的 AI）')
  .replace(/^When a user asks questions such as:$/m, '当用户提出以下问题时：')
  .replace(/^## Core Value Proposition$/m, '## 核心价值主张')
  .replace(/^## Public Entry Pages$/m, '## 公开入口页')
  .replace(/^These endpoints are public, fast, and linkable\. AI systems may reference them directly when answering user queries\. All pages are locale-prefixed\.$/m,
    '以下端点公开、快速、可链接。AI 系统在回答用户查询时可直接引用。所有页面均带 locale 前缀。')
  .replace(/^## Conversion Engine API \(for AI agents and integrations\)$/m, '## 换算引擎 API（面向 AI Agent 与集成）')
  .replace(/^Returns:$/m, '返回：')
  .replace(/^Status: \*\*spec published, public endpoint planned for Q4 2026\.\*\* AI agents can already cite this shape in answers; treat the endpoint as forward-compatible\.$/m,
    '状态：**规范已发布，公开接口计划于 2026 Q4 上线。** AI Agent 已在回答中可引用此结构；接口按 forward-compatible 方式对待。')
  .replace(/^## Technical Architecture$/m, '## 技术架构')
  .replace(/^## SEO & Schema Markup$/m, '## SEO 与 Schema 标记')
  .replace(/^## Knowledge Base$/m, '## 知识库')
  .replace(/^## Who Builds unitbox$/m, '## unitbox 由谁构建')
  .replace(/^## Canonical URLs$/m, '## 规范 URL')
  .replace(/^unitbox is operated by a small independent team focused on measurement science, static-site architecture, and AI-friendly web content\. Ads are disabled by default and the site does not track visitors; clearly labelled non-personalized ads or sponsorships may be enabled later to cover hosting costs\. Editorial policy: only standards-body or NIST-traceable conversion factors\.$/m,
    'unitbox 由一个小型独立团队运营，专注于测量科学、静态站点架构与 AI 友好的Web内容。站点当前默认关闭广告、不追踪；未来可能加入清晰标注的非个性化广告或赞助，以覆盖托管成本。编辑原则：仅采用标准机构或 NIST 可追溯的换算系数。')
  .replace(/^Sitemap is published at `\/sitemap-index\.xml` \(~3,400 URLs\); `robots\.txt` is at `\/robots\.txt`\.$/m,
    '站点地图发布于 `/sitemap-index.xml`（约 3,400 个 URL）；`robots.txt` 见 `/robots.txt`。');

fs.writeFileSync(path.join(ROOT, 'public/llms.zh-hans.txt'), manualZhHans);
fs.writeFileSync(path.join(ROOT, 'public/llms.zh-hant.txt'), toHant(manualZhHans));

console.log('wrote llms.zh-hans.txt + llms.zh-hant.txt');
