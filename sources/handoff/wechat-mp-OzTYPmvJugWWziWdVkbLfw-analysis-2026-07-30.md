# WeChat SEO 文章分析 · unitbox 对位 handoff

> 原文：https://mp.weixin.qq.com/s/OzTYPmvJugWWziWdVkbLfw
> 作者：独立开发者笔记 · 2026-07-10
> 抓取：kimi-webbridge (Chrome 登录态绕过微信 CAPTCHA)
> 分析：杨总明天用 · 2026-07-30 23:30 (GMT+8) 完成

---

## 一句话核心 thesis

> **小团队 SEO 失败不是因为内容不够，而是 Google/AI 还没建立对你的实体信任。增长目标不是"排第几名"，而是"被引用/被推荐的概率"。**

---

## 6 个可执行 takeaways (按优先级排序)

### T1 · 实体一致性 (Entity Consistency)
**原文要点**：产品名、品类词、创始人信息、解决的问题、用户场景必须在 5+ 个独立可信来源里"稳定共现"——官网、文档、目录站、GitHub、Product Hunt、Reddit、博客测评、API 文档。

**unitbox 对位**：
- ✅ 已做：unitbox 名 / "unit conversion" 品类在 1136 页 + OpenAPI + llms.txt + 3 locale × hreflang + JSON-LD 多页注入（WebSite / Organization / SoftwareApplication / FAQPage / HowTo / BreadcrumbList）
- ⚠️ 缺口：单元转换是红海品类（Google "unit converter" 首页全是 calculator.net / convertworld.com / rapidtables.org 等 DA 80+ 大站），实体信号被淹；**没有 Product Hunt / Reddit / GitHub repo / 行业目录站 mention**
- 🚀 行动：
  - **第 1 周必做**：GitHub 开源 repo（哪怕只是把 llms.txt + OpenAPI 同步 push）+ Reddit r/SideProject / r/InternetIsBeautiful / r/webdev 发 launch post（已有 memory [[hark-reddit-post-tracking]] 模板可复用）+ Product Hunt 提交
  - **第 2 周**：3 个免费工具目录站（alternativeto.net / producthunt.com / devhunt.io 等）提交

### T2 · SERP 共识先行 (Match Consensus Before Differentiation)
**原文要点**：写内容前先看 Google 首页在奖励什么页面类型（工具页 / 列表页 / 教程页 / 对比页 / 论坛 / 文档 / 视频）。**先匹配共识，再加信息增益**。

**unitbox 对位**：
- ✅ 已做：v0.4 主页已分析 SERP top 5（memory [[unit-now-seo-arena-2026-07-30]]）→ 3 Schema 差异化 + internal-gap differentiators
- ✅ 已做：1135 个 `meter-to-foot` 风格工具页 + 109 个 unit 详情页 + 14 篇文章 + 9 个对比页——页面类型矩阵覆盖完整
- ⚠️ 缺口：SERP 共识是**单次快照**做出来的（v0.4），没建循环；**AI Overview** 视角缺（原文强调 Gemini/Perplexity/ChatGPT 概率分布）
- 🚀 行动：
  - 每 30 天用 `site:` + `intitle:` 跑 20 个目标关键词 SERP diff，看 Google 是否切换到 AI Overview
  - 写一个 tools/llm-coverage-check.md，每月查 "unit converter" / "kg to lbs" / "meter to feet" 在 ChatGPT/Perplexity/Gemini 的回答里出现哪些站

### T3 · 单点 viral 工具 (Single Viral Tool, Not Multi-Tool Suite)
**原文要点隐含**：小团队资源有限，要在**一个垂直做透**而非分散到多个工具。

**unitbox 对位**：
- ✅ 已做：v0.4 战略 pivot（memory [[unit-now-v04-i18n-locale-prefix-ship-2026-07-30]]）—— 从 4 个工具 → 1 个 viral tool (PNG compressor)
- ✅ 已做：PNG compressor 隐私 hook（client-side，不上传）+ 多编码器 pick-smallest (UPNG lossless + UPNG lossy 256 + canvas fallback)
- 🚀 行动：
  - 1 周内发 Reddit launch post：**"I built a client-side PNG compressor that doesn't upload your files"**（隐私 = viral 触发器，tinypng / remove.bg 范式）
  - 同时把 PNG compressor 单独拆出 `/[locale]/tools/png-compressor/` 作为对外展示的旗舰 demo

### T4 · 外部平台曝光矩阵 (External Platform Matrix)
**原文要点**：早期不要只押官网，要 Product Hunt / GitHub / Reddit / YouTube / LinkedIn / 目录站 / Medium+Dev.to+Hacker News 矩阵曝光。

**unitbox 对位**：
- ❌ 当前 = 0（v0.4 刚 ship，外部 mention 几乎为 0）
- 🚀 行动（按 ROI 排序）：
  1. **GitHub repo**（1 天，开源 OpenAPI + llms.txt，README = 介绍 + 引用 unitbox）—— 给搜索引擎和开发者信任信号
  2. **Reddit r/SideProject** launch post（已有 memory [[hark-reddit-post-tracking]] 模板 + 1uwzt78+cron 跟踪）
  3. **Product Hunt 提交**（要准备 hunter + tagline + maker 头像 + 4 张图）
  4. **Hacker News "Show HN"** post（用 PNG compressor 做 hook："Show HN: I built a client-side PNG compressor that never uploads"）
  5. **行业目录站**：alternativeto.net, saashub.com, devhunt.io, wikiaitools.com, toolify.ai 各提交一次
  6. **YouTube 短视频**：录 60s 演示 PNG compressor 压缩 1MB→200KB（已有 DJI Action 5 Pro 设备，memory [[yang-driving-video-side-project-2026-07-25]]）—— 同时给自驾频道+工具站做素材

### T5 · AI 搜索可见度检查 (AI Visibility Audit)
**原文要点**：第 7 天查 ChatGPT / Perplexity / Gemini 是否提到你的产品，归到哪个品类，会不会引用竞品——找缺口。

**unitbox 对位**：
- ❌ 未做过 AI 可见度系统检查
- 🚀 行动：
  - 写一个 `tools/llm-coverage-check.sh` + 每月 cron 跑 30 个长尾查询
  - 查 "best unit converter for X" / "X to Y calculator" / "convert Z online" 类 query 在 ChatGPT/Perplexity/Gemini 的 top 3 引用源
  - 记录哪些品类 unitbox **被引用了** / **没被引用** / **被错认成竞品**（例如 unitbox 被认成 unitconverter.net）
  - 缺口驱动下一步：缺对比页 → 加 /compare/unitbox-vs-X；缺文档 → 加 /docs/api；缺第三方 mention → 去 Reddit / ProductHunt

### T6 · 7 天动作清单（直接照搬原文）
| Day | 动作 | unitbox 当前状态 | 后续 |
|---|---|---|---|
| 1 | 统一实体信息 | 部分（首页 hero + footer + OpenAPI + llms.txt 一致，但 GitHub/Reddit/PH 缺位） | 写一份 entity-claim.md，所有平台同步这一段话 |
| 2 | 外部资产清单 | 缺 | 建 `external-presence.md`，列出应有 vs 实际 |
| 3 | 5 个目标关键词 SERP 逆向 | 已做 v0.4 但单次 | 月度 cron 化 |
| 4 | 补一篇"符合共识"主页面 | 已做（calculator + 1135 pair 工具页 + 14 articles） | 检查每类关键词 SERP 共识是否都有对应页 |
| 5 | 加入信息增益 | 部分（FAQ + 表格 + 公式） | 加可下载 CSV / 真实测试截图 / API demo widget |
| 6 | 找 10 个外部平台提交 | 0 | 第 1 周必完成 5 个：GitHub / Reddit / ProductHunt / HackerNews / 2 个目录站 |
| 7 | 检查 AI 可见度 | 0 | 写 llm-coverage-check.md 跑第一轮 |

---

## unitbox 当前实体信任网络评分 (loop 视角)

| 信号源 | 当前 | 7 天后目标 | 30 天后目标 |
|---|---|---|---|
| 官网 (1136 HTML × 3 locale) | ✅ 95/100 | 95 | 95 |
| OpenAPI + llms.txt (3 locale) | ✅ 90/100 | 90 | 90 |
| JSON-LD (WebSite/Org/SoftApp/FAQ/HowTo) | ✅ 90/100 | 90 | 90 |
| hreflang × 3 locale | ✅ 95/100 | 95 | 95 |
| **GitHub repo** | ❌ 0 | ✅ 80 (开源 SDK + README) | 90 (有 stars) |
| **Reddit mention** | ❌ 0 | ✅ 60 (1 个 launch post) | 80 (3+ 帖子) |
| **Product Hunt** | ❌ 0 | ✅ 70 (提交) | 85 (top 5 of day) |
| **Hacker News** | ❌ 0 | ✅ 60 (1 Show HN) | 70 (2+ 帖子) |
| **行业目录站 mention** | ❌ 0 | ✅ 40 (2 个) | 70 (10 个) |
| **YouTube demo** | ❌ 0 | ⚠️ 30 (录 1 段) | 60 (3 段) |
| **LinkedIn founder post** | ❌ 0 | ⚠️ 20 (1 post) | 50 (3+ post) |
| **第三方测评/采访** | ❌ 0 | ❌ 0 | 30 (1 个 KOL 提到) |
| **真实用户讨论** | ❌ 0 | ❌ 0 | 40 (Reddit/Discord/HN 反馈) |
| **AI 引用 (ChatGPT/Perplexity)** | ❌ 0 | ⚠️ 30 (初次 check) | 60 (被 5+ 类查询引用) |
| **总分 (加权)** | **45/100** | **70/100** | **85/100** |

---

## 给杨总明天用的 3 个动作 (≤15 分钟可启动)

1. **GitHub repo 创建（30 分钟）**——把当前 OpenAPI 规范 + llms.txt + 3 locale i18n dict + PNG compressor 客户端代码打包成 MIT 仓库发布。repo README 第一行 = 单元转换的 open-source engine。
2. **Reddit launch post 模板（10 分钟）**——参考 memory [[hark-reddit-post-tracking]] r/SideProject 模板，写一段 "Show r/SideProject: I built unitbox, an open-source unit conversion engine for AI Agents"。配 1 张 PNG compressor 截图。
3. **AI 可见度首次 check（15 分钟）**——用 kimi-webbridge 跑 5 个查询：best unit converter / kg to lbs online / meter to feet / celsius to fahrenheit / temperature conversion tool。记录 ChatGPT / Perplexity 各自 top 3 提到哪些站。

---

## 引用 + 关联

- 原文：[[wechat-mp-OzTYPmvJugWWziWdVkbLfw-raw-2026-07-30]]
- unitbox v0.4 ship：[[unit-now-v04-i18n-locale-prefix-ship-2026-07-30]]
- PNG compressor：[[unitbox-png-compressor-v040-ship-2026-07-30]]
- unitbox SEO arena：[[unit-now-seo-arena-2026-07-30]]
- Reddit 跟踪：[[hark-reddit-post-tracking]]
- 反向思考：原文的 "consistency" 主张 = openfate "实体可信" 范式一致——参见 [[openfate-mcp-learnings-2026-07-30]]

---

## 风险

- **品类红海**：unitbox 落在红海 (unit conversion)，大站 DA 80+ 拦着。**唯一破局 = 单点 viral + AI 时代差异化 (llms.txt + OpenAPI)**——这不是传统 SEO 游戏，是 AI 入口卡位战。
- **执行依赖外部平台节奏**：ProductHunt / HackerNews / Reddit 都不在自己控制内，预期 30 天只跑通 5/10 平台就算 good-enough。
- **杨总时间预算**：本 handoff 7 天动作清单需要 ~20 小时执行，按个人精力拆 4 周完成；**单周 ≤ 5 小时 = good-enough**。

---

## 杨总个人增长对位 (5 层漏斗 · CLAUDE.md 增长协议)

> **默认问题：杨总如何增长？** — 把文章方法论从 unitbox 视角拉到杨总个人 IP 视角。

### L1 曝光（小红书重点）
- **文章核心信号**：早期不要只押官网，要 5+ 平台矩阵曝光
- **杨总对位**：当前主战场 = XHS 7 天人设验证（memory [[xhs-yangzong-ainative-sprint]]）+ 公众号 video 号 + 视频号
- **缺口**：**没有 Product Hunt / GitHub / HN / 行业目录站** 类"开发者/AI 圈"曝光；杨总在小红书外**没有独立开发者圈 presence**
- **7 天动作**：建 GitHub 个人主页（README = 杨总的 AI Native OS + unitbox + daka-pet + 12 verticals 索引）+ Show HN 一次「独立开发者一天 OS」（对位 ai-fleet/AGENTS.md）

### L2 信任
- **文章核心信号**：实体一致性 = 产品名/品类/创始人信息在 5+ 独立源共现
- **杨总对位**：
  - ✅ "杨总 + 西安 + AI Native" 实体在小红书/朋友圈/雪球/微信已建
  - ⚠️ **外部 KOL 互引极少**（仅有 [[fei-fan-learning-spec]] 等几个 anchor）—— 这就是 unitbox "没有第三方 mention" 的杨总版问题
  - 🚀 **动作**：每周写 1 篇 1500 字深度文（XHS 长文 / 公众号 / 即刻 / 知乎），每篇结尾带 3 个 KOL 引用 → 触发互引概率

### L3 承接（加微信）
- **文章核心信号**：AI 搜索时代 = "被推荐概率" = 进入候选名单
- **杨总对位**：
  - 当前小红书主页引流到微信的转化率未量化（memory [[xhs-yangzong-ainative-sprint]] v0.1 缺漏斗数据）
  - 🚀 **动作**：本周装个飞书短链 / 短链宝追踪 XHS → 微信转化率；同时按文章 #5 段"AI 可见度"思路查 ChatGPT "AI Native OS 独立开发者" 类 query 的 top 3 = 当前 AI 引擎怎么"推荐"杨总

### L4 变现（咨询/西安本土）
- **文章核心信号**：实体信任 + 外部 mention = 增长前提；变现是后置
- **杨总对位**：
  - 产品阶梯 199 咨询 → 99 小课 → 项目合作 已落地（记忆锚）
  - ⚠️ **咨询流量当前 0**——核心瓶颈 = L2 信任不足（没 ProductHunt / HN / KOL 互引 = AI 不推荐 = 流量起不来）
- **结论**：文章方法论 = 杨总当前卡点的**精确诊断书**

### L5 复利
- **文章核心信号**：稳定共现 = 系统级复利
- **杨总对位**：
  - 12 verticals 矩阵（memory [[one-person-ai-native-os-audit]]）= 杨总的"实体网络"
  - 🚀 **动作**：把 unitbox / daka-pet / 蒋耀锴访谈全集 / [不惑日读] / 自驾频道 5 条线统一挂一个 `yang.work/` 入口页，互相稳定共现（"杨总在做什么"一次讲清），这正是文章 #02 段的精神

### 杨总对位 = 单元对位的对位（同构）
> 文章教小产品做"实体一致性"，杨总个人 IP 同样要"实体一致性"。两条线的瓶颈 = **同一个 = 第三方 mention 不足**。解决路径也对称：开源 GitHub repo + Reddit launch + Show HN + 互引 KOL。

---

## 一句话给杨总明天用

> 文章 = "SEO 不是内容问题，是信任问题；信任不是官网一句话，是多源稳定共现"。**杨总个人 IP 和 unitbox 当前都卡在第三方 mention = 0，7 天行动 = 开源 + 互引 + AI 可见度 check 三件套。**