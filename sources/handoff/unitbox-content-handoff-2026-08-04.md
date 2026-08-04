# unitbox 内容扩充 Handoff · 2026-08-04

> 给接手「加垂直内容」的 agent。读完能动手。项目根:`/Users/vincent/work/experimental/unit-now/`
> 本文不重复 `scripts/agent-prompt.md`(那个是增长观测 agent,本文是**内容生产** agent)。

---

## 0. TL;DR · 你要干什么

unitbox 是单位换算站(`unitbox.online`),靠 **SEO + AI 可发现性**获客。**当前 Google 索引 0/3424、人类流量≈0**——内容深度不够是核心瓶颈之一。你的活:**加有搜索意图、有深度的垂直内容**,让 Google 觉得"这站有真东西"从而开始索引。

最有杠杆的 3 件事(按 ROI):
1. **把现有 14 篇 EN articles 翻译成 zh-hans + zh-hant**(body 现在是 EN 单源,zh 页面显示英文 = 浪费)
2. **加行业垂直换算内容**(烹饪/健身/建筑/金融/科学——每个垂直一篇深度 article + 对应 compare 页)
3. **加 compare 页**(对比型 query,如"斤 vs 磅""公历 vs 农历",SERP 竞争低)

---

## 1. 战略背景(为什么内容是当前杠杆)

| 信号 | 现状 | 含义 |
|------|------|------|
| Google indexed | **0 / 3424** | Google 抓了 sitemap 但不索引 = 觉得内容不够值得收 |
| GSC impressions | 5(28d) | 几乎没排名 |
| 真人类 UV | <50/天(99% 爬虫) | 没人来看 |
| AI 引擎引用 | 0/15 baseline | Perplexity/Claude 都不引用 |

**Google 对"3424 个自动生成的换算页 + 0 外链 + 4 天新域名"很谨慎。** 加手写深度内容(article/learn/compare)是最快给它"信任信号"的方式。**1 篇高质量 article > 100 个冷门换算对。**

---

## 2. 内容架构(东西放哪)

```
src/data/
├── articles.ts        ← 手写文章(14 篇 EN)。你主要改这里。
├── learn.ts           ← learn 主题(9 个)
├── categories.json    ← 12 个单位类别(温度/长度/质量...)。一般别动。
└── units.json         ← 200+ 单位定义。一般别动(驱动 1135 个换算对自动生成)。

src/pages/[locale]/    ← 路由(en/zh-hans/zh-hant 三套,自动生成)
├── articles/[...slug].astro   ← 文章页(吃 articles.ts)
├── learn/[...topic].astro     ← learn 页(吃 learn.ts)
├── compare/[...slug].astro    ← 对比页
├── [from]-to-[to].astro       ← 换算对页(自动,别手写)
└── [unit].astro               ← 单单位页(自动)

src/lib/i18n/
├── en.ts / zh-hans.ts / zh-hant.ts   ← UI 文案字典(三套 key 必须对齐)
├── locales.ts / routes.ts / index.ts
```

---

## 3. 加一篇 Article(最常见操作)

`src/data/articles.ts` 结构:
```ts
export const articles: Article[] = [
  {
    slug: 'what-is-a-unit',                    // URL slug,全站唯一
    title: 'What is a unit? A practical guide',
    description: 'Why every measurement...',   // meta description + 卡片摘要
    category: 'Reference',                      // Reference/Length/Data/Temperature...
    readTime: '6 min',
    body: `markdown 正文...`,                    // 支持 **加粗**、- 列表、\n\n 分段
    publishedAt: '2026-07-30',                  // 可选
    dateModified: '2026-08-04',                 // 可选,改了就更新
  },
];
```

**操作:**
1. 在数组里加一个对象(别动现有的)
2. `pnpm gen:articles` 有 AI 生成脚本(`scripts/gen-articles.mjs`)——先读它再决定用不用
3. `pnpm build` 验证不报错
4. slug 会自动进 sitemap,自动生成 `/en/articles/<slug>/` + `/zh-hans/...` + `/zh-hant/...`

### ⚠️ 翻译缺口(高 ROI 机会)

**现在 `article.body` 是 EN 单源,3 locale 共用同一份英文正文。** zh-hans/zh-hant 的文章页 = 中文 UI 外壳 + 英文正文。这是个明显的浪费。

**两种修法(选一):**
- **A. 翻译字段扩展**:把 `body` 改成 `body: { en, 'zh-hans', 'zh-hant' }`,路由按 locale 取。改 `articles.ts` + `[...slug].astro`(line 28 取 body 处)。
- **B. 独立 zh corpus**:`articles.zh-hans.ts` / `articles.zh-hant.ts`,按 locale 分流。量大但隔离干净。

先跟杨总/主判断确认走 A 还是 B,再动手(这是 schema 改动,影响所有 article)。

---

## 4. i18n 纪律(会卡构建,务必遵守)

**`en.ts` / `zh-hans.ts` / `zh-hant.ts` 三个字典的 key 集合必须完全一致。** 构建时有 drift assertion,**key 不齐直接抛错 build 失败**。

加新 UI 文案时:
1. 三个文件**同时**加同一个 key
2. 别只改 en 忘了 zh

---

## 5. SEO + AI 约定(写内容时记住)

| 约定 | 怎么做 |
|------|--------|
| **Schema/JSON-LD** | 文章页已自动出 Article schema;换算页出 QuantitativeValue。新页面类型看 `Base.astro` 有没有对应 schema,缺就补 |
| **llms.txt** | `public/llms.{en,zh-hans,zh-hant}.txt` × 3 locale。加重要新内容,在这 3 个文件里登记(AI 引擎靠它发现) |
| **canonical** | 每页 `<link rel=canonical>`,locale 间用 hreflang(已配) |
| **搜索意图** | 写之前先想:这个 query 用户想要什么答案?文章要在前 2 段给答案,再展开(不是维基百科式长引言) |
| **内链** | 文章里链接到相关换算页(`/en/celsius-to-fahrenheit/`),双向导权 |

参考方法论:`memory: wechat-seo-trust-article-2026-07-30`(实体信任+SERP共识+外部矩阵+AI可见度 4 件套)。

---

## 6. 构建 / 部署 / 验证命令

```bash
cd /Users/vincent/work/experimental/unit-now

pnpm install              # 首次/依赖变更后(注意:pnpm-workspace 设了 verifyDepsBeforeRun:false,dev 不自动装)
pnpm build                # astro check + build,自动跑 postbuild 生成 sitemap
pnpm test                 # 验证换算逻辑 + i18n drift

# 本地预览
pnpm dev                  # http://localhost:4321 (或 start.sh 一键起)

# 部署到 CF Pages(改线上!先确认)
pnpm build
wrangler pages deploy dist --project-name=unitbox
# ⚠️ 部署后 lastmod 会被 build-sitemap 设为当天——见下面 Gotcha
```

**改完必跑机械验证**(杨总硬规则):`pnpm build && pnpm test`。别靠"看着对"。

---

## 7. 你的内容怎么被度量(12h 自动 cron)

不用你手动盯,但要懂信号语言。`launchd com.chengsan.unitbox-growth-ops` 每 12h(00:00+12:00)跑:

| 脚本 | 看什么 | 你的内容影响它吗 |
|------|--------|----------------|
| fetch-gsc.mjs | Google 曝光/点击/position | ✅ 你加的 article 排名上去 → impressions 涨 |
| **fetch-gsc-sitemaps.mjs** | **indexed 数 0→N 拐点** | ✅ **核心**:你加内容让 Google 愿索引,indexed 涨 |
| fetch-cf.mjs | 总流量 + day_detail(path/host) | 间接 |
| fetch-bing-stats.mjs | Bing URL 级 crawl | 间接 |
| ai-vis.mjs | Perplexity/Claude 是否引用 unitbox | ✅ 有深度内容才可能被 AI 引用 |

**盯这一个数就够:`.observe/{date}/gsc-sitemaps.json` 的 `indexed`。** 0→N 是你的内容起效的硬信号。

---

## 8. Gotchas(踩过的坑)

1. **cron node PATH**(2026-08-04 刚修):launchd 不继承 nvm,prep 脚本头部已加 nvm 解析。改 cron 别删那段。
2. **build-sitemap.mjs** 是 postbuild 手写脚本(`@astrojs/sitemap` 跟 catch-all 路由不兼容)。所有页 lastmod 都设为当天——别惊讶。
3. **IndexNow 422 + Bing Submit 400**(未修):Bing 提交通道目前挂(验证/key 问题)。**Google Indexing API 正常**,内容上线后跑 `node scripts/prioritize-indexing.mjs` 主动推给 Google。
4. **pnpm-workspace verifyDepsBeforeRun=false**:`dev`/`start` 不自动装依赖,改了 package.json 必须手动 `pnpm install`。
5. **astro.config `trailingSlash:'ignore'`**:带不带斜杠都行,但 sitemap 里统一带斜杠。
6. **3 locale drift**:见第 4 节,会卡 build。

---

## 9. 垂直内容 idea 清单(起点,非约束)

按搜索量 × 竞争 × 跟换算的相关度排:

| 垂直 | article idea | 对应 compare/换算 |
|------|-------------|-----------------|
| **烹饪** | "Baking 调温:°C vs °F vs Gas Mark 对照" | cup-ml, oz-g, tbsp-ml |
| **健身/减脂** | "体脂/BMR 计算里的单位陷阱" | kg-lb, lb-kg, kcal-kj |
| **建筑/DIY** | "木工尺寸:英寸分数 vs 毫米" | inch-mm, feet-m, sqft-sqm |
| **金融** | "汇率 vs 单位换算:为什么逻辑一样" | (概念性,弱换算) |
| **科学** | "压力单位全解:Pa/bar/psi/mmHg/atm" | 已有 article,可深化 |
| **数据存储** | "为什么 1TB 硬盘只有 931GB" | 已有 kb-kib,可做 compare |
| **中国大陆本地** | "斤/两/亩/里 vs 公制——zh-hans 独占 query" | jin-kg, li-km, mu-sqm, liang-g |

**zh-hans 独占 query(市制单位)是蓝海**——Google 上中文市制换算内容稀薄,且 unitbox 的 zh-hans 已建好。

---

## 10. 深度参考

- `docs/ARCHITECTURE.md` — 架构细节
- `sources/handoff/unitbox-v04-handoff-2026-07-30.md` — v0.4 完整 handoff
- `sources/handoff/unitbox-vs-timenow-eval-2026-07-31.md` — 竞品对标(3 个瓶颈)
- `.observe/LAUNCH-7-31-AUTOPSY.md` — launch 流量复盘(为什么现在 0 流量)
- `memory: unitbox-growth-monitor-stack` — 监控栈全貌
- `memory: topic-unitbox-ships` — 6 个 ship log

---

## 接手第一件事

读完本文 → `cat src/data/articles.ts`(看现有 14 篇的风格/深度)→ 跟杨总确认翻译走 A/B 哪条 → 选 1 个垂直(推荐**市制单位 zh-hans** 或**烹饪**)→ 写 1 篇 article + 翻译 → `pnpm build && pnpm test` → 交回主判断推 Google Indexing API。
