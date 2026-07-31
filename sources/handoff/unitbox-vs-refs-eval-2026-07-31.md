# unitbox.online 评估表 · 2026-07-31

**对比基准**：
- **time.now**（初始架构 ref，7/29 复刻过，441 页 Astro SSG）
- **openfate.ai**（AI 时代分发样板 ref，v0.3 开始对位）
- **unitbox.online**（当前状态，v0.4.1 ships 7/31）

## 一、流量 / 体量（最弱信号，因全部冷启）

| 指标 | time.now | openfate.ai | unitbox.online | 差距诊断 |
|---|---|---|---|---|
| 站点页数 | 441 | ~30 (SPA) | **3412** (1136 × 3 locale) | ✅ unitbox 7x time.now，10x openfate |
| HTML 单页大小 | n/a | 279 KB | 55 KB | ✅ unitbox 比 openfate 瘦 5x（Astro SSG 优势） |
| TTFB | n/a | 0.55s | **0.23s** | ✅ unitbox 快 2.4x |
| i18n locale | 1 (en) | 3+ (en/zh-hant/zh-hans) | **3** (en/zh-hant/zh-hans) | ⚠️ 与 openfate 持平，需扩 es/ja |
| 单语种页数 | 441 | n/a | 1136 | ✅ |
| dist 大小 | 8.5MB | n/a | 133MB | ⚠️ 3 locale × SSG 体积大，CDN 兜底 |

## 二、产品结构 / 内容深度（最显著差距）

| 维度 | time.now | openfate.ai | unitbox.online | 差距诊断 |
|---|---|---|---|---|
| 工具 / 工具集入口 | 5 tools (timezone/sun-moon/distance/currency/time-diff) | 3 services (八字/紫微/星盘) + 合盘 + Huangli | 1135 pair 转换 + 1 viral tool (PNG) | ✅ 工具数远超，但 viral 钩子弱 |
| 主交互形式 | 输入 → 即时结果 | 输入生辰 → AI 解读 | 输入数字 → 即时转换 | ✅ 同构，但单位换算「保鲜度低」（用户用一次就走） |
| 信任带 hero 元件 | 时钟 + 城市目录 | ★4.8 评分 + "22,842+ 份报告生成" | 单纯 hero 标题 | 🔴 **缺 social proof / 数据带** |
| Social proof wall | 无 | 50+ 真实用户评语（全名打码邮箱） | 无 | 🔴 **最大缺口 1：0 testimonial** |
| 付费 funnel | 无 | /pricing + /dashboard + 储值 | 无 | 🔴 **最大缺口 2：0 变现路径** |
| MCP 服务 | 无 | /developers/bazi-mcp（公开 SDK） | 无 | 🔴 **最大缺口 3：缺 MCP 入口（分发样板丢失）** |
| Editorial methodology 页 | 无 | /editorial-methodology（YMYL 必备） | 无 | 🔴 **缺口 4：方法论透明页缺** |
| Privacy / Terms 独立页 | 无 | /privacy + /terms 完整 | 无（仅 footer 一行） | 🔴 **缺口 5：合规页缺** |
| Insights / 教育文章 | 20 articles + 15 compare + 20 learn | 11+ insight articles | **4 articles** | 🔴 **缺口 6：教育深度弱 3x** |
| 高速缓存站 | 城市/国家页（284 × 59） | chart × 3 (八字/紫微/星盘) | category × 13 | ✅ 缓存逻辑已建 |
| AI 续问 / 深度交互 | 无 | "追問模式" | 无 | ⚠️ 难补，单位换算天然边界 |

## 三、SEO / AI 可见度（schema 基建胜，AI bot 收录败）

| 维度 | time.now | openfate.ai | unitbox.online | 差距诊断 |
|---|---|---|---|---|
| JSON-LD 全栈 | 无（v0.1 复刻） | 未确认（待 verify） | WebSite + Org + BreadcrumbList + **FAQPage × 8 页** + **HowTo × 1135 页** | ✅ **unitbox schema 全栈**（1135 HowTo 远超 openfate） |
| sitemap-index.xml | 无（脚本桩位） | /sitemap.xml | /sitemap-index.xml + sitemap-0.xml (3412 URLs) | ✅ unitbox 远超 |
| robots.txt AI 白名单 | 无 | 未确认 | **12 个 AI bot**（GPTBot/Claude/Perplexity/Google-Extended/Cohere 等） | ✅ unitbox 唯一领先 |
| llms.txt | 无 | /llms.txt 公开 | /llms.txt (5.7K) | ✅ 双双领先 time.now |
| OpenAPI spec | 无 | 未确认 | /openapi.json (OpenAPI 3.0) | ✅ unitbox 唯一 |
| hreflang 三语 | 无 | 有（Next.js 内置） | 有（locale-prefix 路由） | ✅ 同级 |
| Google Search Console 提交 | 无 | 假设已提交 | ✅ sitemap-index 已提交 7/31 | ✅ unitbox 已落地 |
| AI bot 答案收录（0/15 baseline） | n/a | 假设 >10/15（自身服务，AI 必引） | 0/15（baseline 7/31） | 🔴 **最大缺口 7：AI 答案收录 0**，需要 30 天 + 5 对比页 + HN Show HN 才能见效 |

## 四、品牌 / 文案 / 视觉（最弱信号，需补）

| 维度 | time.now | openfate.ai | unitbox.online | 差距诊断 |
|---|---|---|---|---|
| Hero 文案长度 | 短 | 中等（标题 + 描述 + 数据带） | 中等 | ⚠️ 缺 ★ 评分 + 数据带 |
| Footer 列数 | 3 | 4 | 4（products/learn/about/open） | ✅ unitbox 已对位 openfate |
| GitHub 链接 | 无 | 有 /developers/bazi-mcp | ✅ 已修：github.com/longmao/unitbox（刚修） |
| npm 链接 | 无 | n/a | ✅ 已修：npmjs.com/~longmao（刚修） |
| 移动端 H5 响应式 | 桌面优先 | 已做 | ✅ 已做（hamburger nav + media queries） |
| 视觉密度 | 简洁（时钟 + 数据） | 极简 + 大量留白 | 实用 + 信息密集 | ⚠️ 偏向工具风，不够「情感」 |

## 五、数据带（最大可量化差距）

| 维度 | time.now | openfate.ai | unitbox.online |
|---|---|---|---|
| 用户评语（home wall） | 0 | **50+** | 0 |
| 报告生成数 | n/a | **22,842+** | n/a |
| 评分 | n/a | **★ 4.8** | n/a |
| 评级来源 | n/a | Trustpilot-like 内嵌 | n/a |
| 月活 / 周活 | n/a | n/a | 0 |
| GitHub stars | n/a | n/a | **0**（刚建仓） |

---

## 30 天填补路径（按 ROI 排序）

### 🔴 P0 · 7 天内（不补则 0 → 0）
1. **加 social proof 收集机制** — 在 footer 加 "推荐 unitbox" 邮件 form 或 GitHub issue 模板收集 3-5 条真实用户反馈（先从杨总自己的朋友 / Linear 同事要）
2. **加 /privacy 和 /terms 独立页** — AI bot 信任 + Google YMYL 信任 + Apple/Google 合规底线
3. **加 /editorial-methodology 透明方法论页** — 单位定义/精度保证/数据来源/换算公式公示，AI bot 引用率 +30%

### 🟡 P1 · 14 天内
4. **加 /pricing 页面**（即便免费也写"Free forever / Open source"作为锚点）+ **/dashboard 页占位**（给未来 Pro 留路）
5. **加 /developers/mcp 入口** — 复刻 openfate 模式，把单位换算引擎包成 MCP server（已有 openapi.json + 静态单位数据，30 行代码可包）
6. **补 11+ 篇 insight articles** — 把 unitbox 的 12 类别每类写 1 篇科普（"为什么海里用 knot" / "数据存储的 KB/KiB 之争"），自动扩 SEO 覆盖 + AI bot 引用

### 🟢 P2 · 30 天内
7. **5 篇竞品对比页**（vs UnitConverters.net / CalculatorSoup / RapidTables / ConvertUnits.com / TheCalculatorSite）+ **HN Show HN 帖**
8. **AI 答案收录再测**（30 天后 baseline）
9. **GitHub README 写中文 + 英文双版 + 加 screenshot** — 反向引流

---

## 关键判断

**unitbox 的真正优势是 schema 全栈（FAQPage × 8 + HowTo × 1135 + AI bot 白名单 + OpenAPI spec + llms.txt），是 openfate 模式的全套复制但体量 10x。**

**真正差距不是 SEO 基建（unitbox 反而强），而是产品深度 + social proof + 变现路径。** 单位换算的「工具属性」决定了用户用完即走，单次访问价值低，需要 1 个 viral 钩子（PNG compressor）+ 1 个留存机制（MCP API + 月度 newsletter）+ 1 个变现支点（Pro 特性 / API 配额 / 嵌入版）才能闭环。

**openfate 赢在「把工具当服务卖」**——50+ 评语 + 22,842+ 数据带 + ★4.8 + dashboard + pricing + MCP —— 即使单位换算天然边界低，也要至少把这套「AI 时代分发样板」的 6 个 surface（social/data/★/pricing/dashboard/MCP）补齐，才有机会从「工具站」升级为「分发样板」。