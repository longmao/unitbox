# unitbox vs time.now 评估 · 2026-07-31

**time.now 是 unit-now 立项初期的克隆对象**——杨总 7/29 完整复刻过（441 页 Astro SSG，BunnyCDN 反爬所以用微信文章当 source-of-truth）。本表对比 unitbox 演进路径。

---

## 一、体量 / 规模

| 指标 | time.now 复刻 (7/29) | unitbox (7/31) | 倍数 |
|---|---|---|---|
| HTML 页数 | 441 | **3424** | 7.8x |
| dist 大小 | 10 MB | 133 MB | 13x |
| build 耗时 | 733 ms | 3.02 s | 4x（可接受） |
| 单页 HTML 体积 | n/a | 54 KB | n/a |
| locale 数 | 1 (en) | 3 (en/zh-hant/zh-hans) | 3x |
| sitemap URLs | 0（脚本桩位空） | 3424 | ∞ |
| BDD 测试 | 100% (200/200 status) | 137/137 vitest pass | ✅ |

## 二、内容结构

| 维度 | time.now | unitbox |
|---|---|---|
| 主入口 | 6 层首页（live clock + 城市/国家/时区目录 + 工具集 + high-stickiness + long-tail topics + 文章/buyers guides） | 5 段首页（hero + 信任带 + 3-step + 12 category 矩阵 + API section） |
| 一级缓存站 | 城市页 284 + 国家页 59 = **343 个地理实体页** | category × 13 = **13 个分类页** |
| 工具子页 | tool/[tool].astro × 15（time-zone / clock / calculator / 等） | pair 页 × 1135 = **1135 个换算对** |
| 学习页 | learn/[topic].astro × 20 | learn/[topic].astro × ~20（部分保留） |
| 文章页 | articles/[...slug].astro × 20 | articles/[...slug].astro × 4 |
| compare 页 | compare/[...slug].astro × 15 | compare/[...slug].astro × N |
| 特殊页 | /premium（付费 funnel 占位）+ /widget（嵌入版）+ /api（开发者 hooks） | /llms + /openapi.json + /privacy + /terms + /methodology + /testimonials（信任面） |
| 单页组件 | LiveClock + SunMoonBlock + RelatedQuestions + FAQ | ConverterWidget + FaqBlock + RelatedQuestions + RecommendedList |
| 数据驱动 | cities.json (284) + countries.json (59) + articles.ts (20) | units.ts 内置 + categories 内置（无外部 JSON） |
| 缓存逻辑核心 | 时区换算（核心） + 太阳月计算 + 时差 | 单位换算（核心）+ 方向感知（affine/reciprocal） |

## 三、SEO / AI 基建

| 维度 | time.now | unitbox | 备注 |
|---|---|---|---|
| sitemap | 脚本桩位（空函数，未跑） | sitemap-index.xml + sitemap-0.xml (3424 URLs) | ✅ unitbox 跑通 |
| robots.txt | 无 | ✅ 12 AI bot 白名单 | ✅ unitbox 唯一 |
| llms.txt | 无 | ✅ 5.7K (openfate 模式) | ✅ unitbox 唯一 |
| OpenAPI spec | 无 | ✅ /openapi.json | ✅ unitbox 唯一 |
| JSON-LD 全栈 | 无 | ✅ WebSite + Organization + BreadcrumbList + **FAQPage × 8** + **HowTo × 1135** | ✅ unitbox 唯一 |
| hreflang | 无 | ✅ locale-prefix 三语 | ✅ unitbox 唯一 |
| Google Search Console | 未提交 | ✅ sitemap-index 已提交 | ✅ unitbox 唯一 |
| AI bot 答案收录 | n/a | 0/15 baseline（7/31） | 待 30 天再测 |
| Webfont 子集化 | 无（Inter bunny.net 全字重） | 无（同样 Inter bunny.net） | ⚠️ 共同缺陷 |

## 四、工程化

| 维度 | time.now | unitbox | 备注 |
|---|---|---|---|
| 框架 | Astro 4 SSG | Astro 4.16.19 SSG | 同 |
| JS framework | 无（vanilla JS islands） | 无（vanilla JS） | 同 |
| BDD 覆盖 | 100%（200/200 status） | 85 → 137 BDD tests pass | ✅ unitbox 有 vitest 测试套 |
| sitemap 集成 | @astrojs/sitemap 撞 [...slug].astro，禁用 | post-build scripts/build-sitemap.mjs | ✅ unitbox 退路 |
| 货币转换 / 时区 | luxon + tz data | 无（不相关） | 各自赛道 |
| Bug 修复轨迹 | Stopwatch DOM 推断死 / FaqBlock import 漏 | ConverterWidget fuel-economy 客户端 JS / RecommendedList href="#" / sitemap 双斜杠 | 各有 3 个 bug |

## 五、演进路径判断

**time.now 复刻是「架构 demo」**：证明 Astro SSG + 数据驱动 + 多语言可以撑起一个独立的小站，但 v0.1 没有 seo / ai / schema / llms / trust 任何一层基建。

**unitbox 是「AI 时代分发样板」**：v0.2 直接补 seo + i18n，v0.3 加 openfate 模式（llms.txt + openapi + schema 全栈 + AI bot 白名单），v0.4 加 locale-prefix + PNG compressor，v0.4.1 加 mobile + privacy/terms/methodology 信任面。

**unitbox 相比 time.now 的本质升级**：
- 从「单语单工具」→「三语 1135 个 pair 工具集」
- 从「无 SEO」→「schema 全栈 + AI bot 白名单」
- 从「手写 sitemap 桩位」→「3424 URLs 自动化」
- 从「裸站」→「7 个 trust surface 全齐（privacy/terms/methodology/about/llms/openapi/testimonials）」

## 六、time.now 模式的可复用价值

- `cities.json + countries.json` 数据驱动 → unitbox 的 `units.ts` 已内置，比 JSON 更类型安全
- `LiveClock` widget 范式 → unitbox 的 `ConverterWidget` 复用同款「单组件 + 静态数据 + 客户端计算」模式
- 「One topic, every angle」架构 → unitbox 已完全套用（unit conversion 是 topic，1135 个 pair 是 every angle）
- **BunnyCDN 反爬 + AI bot 白名单启示** — time.now 用 BunnyCDN 都被反爬，unitbox 用 CF Pages 必须主动白名单 AI bot 才有可能被引用

## 七、v0.1 → v0.4.1 的 9 个 lesson（沉淀进 topic-astro-sites）

1. **Astro 4 + @astrojs/sitemap 撞 [...slug] 路由** → 退路 post-build script（unitbox 已沉淀）
2. **scoped CSS 不穿透 slot** → utility 必须挂 global.css（unitbox 的 grid/card/btn 已挂）
3. **Webfont 子集化** → 共同未做（Lighthouse 失分项）
4. **JSX/TS DOM 推断** → 函数参数标 any 是最快的避坑
5. **手写 sitemap 比 integration 更稳** → 已成 unitbox 默认模式
6. **数据驱动 getStaticPaths 是 1135 pair 的可行性前提** → unitbox 已用
7. **locale-prefix + middleware redirect 比 client-side i18n toggle 更 SEO 友好** → unitbox v0.4 已改
8. **Cloudflare Pages _redirects 兼容 Netlify** → unitbox 已有等价机制
9. **AI bot 白名单 + llms.txt 是新 SEO 基建** → unitbox 已全套（time.now 缺）

---

## 八、关键对比数字（一屏读完）

| 维度 | time.now | unitbox | 升级幅度 |
|---|---|---|---|
| 页数 | 441 | 3424 | **7.8x** |
| 信任面 | 0 | 7 (privacy/terms/methodology/about/llms/openapi/testimonials) | **∞** |
| AI bot 白名单 | 0 | 12 | **∞** |
| Schema 块 | 0 | 4352+ (avg 3.8/页) | **∞** |
| llms.txt + OpenAPI | 0 | ✅ | **∞** |
| locale 数 | 1 | 3 | 3x |
| 内容深度页 / 总页数比 | ~13% (20 articles/441) | ~0.1% (4 articles/3424) | ⚠️ unitbox 长尾深度稀释 |
| 付费 funnel | /premium 占位 | 0 | ⚠️ unitbox 缺失 |

---

## 九、对杨总的判断

**time.now 复刻是技术验证**，不是产品验证。它的价值是「Astro SSG + 数据驱动能撑起 SEO 流量站」这个机制证明。

**unitbox 是产品验证**，是真正的产品尝试。两者定位完全不同——time.now 是「试」工具，unitbox 是「做」工具。

**unitbox 的关键瓶颈不在基建（基建已经全栈领先 openfate/time.now 10x）**，而在：
1. **变现路径**：time.now 试过 /premium 占位，unitbox 反而没有 → 需要补 /pricing + API 配额付费
2. **内容深度**：unitbox 3424 页但只有 4 篇 articles → 1135 个换算对每个应该有独立科普，但实际没有 → 长尾稀释是 SEO 反模式
3. **social proof**：time.now 复刻版也没做，但 unitbox 必须做（参考 openfate 50+ testimonial wall）

**建议**：
- unitbox 不该再继续扩 page count（3424 够了），应该回头补深度（每个 category 写 5 篇 insight articles = 60 篇，能把内容深度从 0.1% 拉到 1.8%）
- /pricing 占位立即可写（不需要真实付费功能，写「Free forever · Open source」就是锚点）
- 30 天后再决定是否要做 /dashboard / MCP server —— 等 5 篇对比页 + HN Show HN + AI bot 答案收录出数据再判断