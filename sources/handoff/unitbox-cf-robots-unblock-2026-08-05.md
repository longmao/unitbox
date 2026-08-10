# unitbox × Cloudflare Managed Robots 封印解封 Loop

**日期**: 2026-08-05 · **状态**: root cause 已定位，待杨总 dashboard 解封（30s 手动）
**对位**: [[unitbox-ai-coverage-baseline-2026-07-31]]（AI 可见度 0/15）· [[unitbox-growth-monitor-stack]]

---

## Loop Engineering 框架

| 阶段 | 内容 | 状态 |
|---|---|---|
| 假设 | CF managed robots 封印 AI bot = AI 可见度 0/15 的 root cause | ✅ 证实 |
| 机制 | CF Free zone "AI Scrapers and Crawlers" toggle ON → 边缘注入 `# BEGIN Cloudflare Managed content` → 全 Disallow 检索型 AI bot | ✅ 证据链闭合 |
| 最小实验 | 跑 `verify-robots-aibots.mjs` 拿基线 | ✅ BLOCKED 5/13 |
| 干预 | 杨总 dashboard 关 toggle（API 改不了，端点 404） | ⏳ 待手动 |
| 证据2 | 关后重跑脚本 → UNBLOCKED | ⏳ |
| 判定 | 7 天后重跑 5 query × 3 engine，unitbox ≥1 cell = 突破 | ⏳ |

---

## Root Cause 证据链（已闭合）

1. **源站策略 = Allow 全部 AI bot**：`public/robots.txt` 明确 Allow GPTBot/ClaudeBot/Google-Extended/CCBot/PerplexityBot…，注释 "per Article 7/30 trust signal strategy"。
2. **构建产物 = 干净**：`dist/robots.txt` 只有 `User-agent:* Allow:/ Sitemap:`，无任何 AI block。
3. **线上 = 被覆盖**：md5 三者全不同 —— live(`7133845c`) / public(`87f74d6a`) / dist(`4f58d9d9`)。线上 robots.txt 含 `# BEGIN Cloudflare Managed content` + 全 AI bot Disallow，**100% 是 Cloudflare 边缘注入**，与源站/部署产物无关。
4. **WebSearch 多源实证（2025-2026 已知坑）**：Cloudflare "AI Scrapers and Crawlers" toggle 默认 silently block GPTBot/ClaudeBot，导致站点从 ChatGPT/Claude 回答消失。检测法 = `curl robots.txt | grep "BEGIN Cloudflare"`。
   - Reddit r/CloudFlare · BrandAxis · Gecko Studio · NYTR SEO · CopilotPost · VerityScore
5. **API 改不了**：`/zones/{zone}/robots_txt`、`/bots/flag`、`/ai_audit` 全 404（Free plan 不支持）。必须 dashboard。

**被 CF 封印的 5 个检索型 AI bot**：GPTBot(ChatGPT) · ClaudeBot(Claude) · Google-Extended(Gemini) · CCBot(Perplexity 等) · Applebot-Extended(Apple Intelligence)。

---

## 🔴 杨总要做的 1 件事（30 秒）

**Cloudflare Dashboard → 关掉 "AI Scrapers and Crawlers" 托管封印**

1. https://dash.cloudflare.com → 登录 → 选 **unitbox.online** zone
2. 左侧 **Security → Bots**
3. 找 **"AI Scrapers and Crawlers"** 卡片（或 "AI Audit" / "AI Bots"）
4. 当前 = Block（机器人图标被划掉）。点 toggle → 切到 **Allow / Allow AI bots**（不 block）
5. 等 1-5 分钟传播
6. 告诉 Claude，跑 `scripts/verify-robots-aibots.mjs` 验证 → 应输出 ✅ UNBLOCKED

**兜底**：dashboard 顶栏搜 "AI"，或看 Security → Settings。"AI Scrapers and Crawlers" 是 2024 末加的 zone-level toggle，Free plan 可见。

**注意**：robots.txt 里的 `Content-Signal: search=yes,ai-train=no,use=reference` 是 Cloudflare 新协议 content signals（search 对 Google/Bing 开放，ai-train=no 是策略性不参与训练——合理保留）。问题只是那 5 个 Disallow。关 toggle 应能去掉 Disallow 块（Content-Signal 是否保留无所谓）。

---

## 验证脚本

`scripts/verify-robots-aibots.mjs`（zero-dep，node 18+）
- 解封前基线：`🚫 BLOCKED — 5/13`（exit 1，cron 可告警）
- 解封后预期：`✅ UNBLOCKED`
- 待办：接进 `scripts/cron/prep_unitbox_growth_12h.sh`（12h 跑一次，回归即飞书告警）

---

## 配套未做项（解封后或下次 loop）

| 项 | 卡点 | 权限 |
|---|---|---|
| GSC 手动 submit sitemap | `last_submitted=null` 从未提交；sa.json scope = `webmasters.readonly` 只读 | 需 dashboard 手动 submit 或给 sa 写 scope |
| `/sitemap.xml` → `/sitemap-index.xml` redirect | 约定路径现在返回 HTML（SPA fallback） | 本地改 `public/_redirects` + 部署 |
| 补推 ja/ko locale URL | sitemap 3424→5736，新增 URL 没走 Indexing API | `scripts/prioritize-indexing.mjs` 已有，重跑 |
| 源站 `robots.txt.ts` vs `public/robots.txt` 冲突 | 动态版（构建生效）没 AI 规则，靠 public 静态版；两者同名 | 统一成一个，下次部署 |

---

## 下一个要盯的信号

1. **解封后即刻**：`verify-robots-aibots.mjs` → UNBLOCKED（5 分钟内）
2. **48h**：`.observe/2026-08-07/gsc-sitemaps.json` 的 indexed 是否 0→N（Google 真开始索引）
3. **7 天**：重跑 5 query × 3 engine（ChatGPT/Perplexity/Gemini），unitbox ≥1 cell 出现 = AI 可见度突破
4. **注意引擎硬约束**：ChatGPT 走阿里云 HK IP 必断（要代理）；Gemini 长 token stall（短 query）；Perplexity 首次过 Cloudflare challenge
