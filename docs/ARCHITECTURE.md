# Architecture — `time.now` Clone

> 一个围绕"时间"组织起来的页面网络 — 不是单一工具，是 SEO 内容系统。
> "把'当前时间、城市时间、国家时间、时区换算、计时器、祷告时间、日出日落、节日、日历、文章内容'全部收进一个大主题下面，然后用海量页面去承接搜索需求。"

## 三个核心原则（来自微信文章 §十一）

1. **不要把网站只理解成"一个工具"** — `time.now` 不是一个时钟工具，而是由 350+ 页面组成的页面网络（首页 + 200 城市页 + 80 国家页 + 25 工具页 + 解释页 + 关系页）。

2. **不要迷信首页** — 首页流量只占总盘 11%。真正的大盘来自海量内页，尤其是城市页（27% 单页）、国家页、工具页和专题页。

3. **不要只做功能，还要做解释和关系页** — 大量页面不只是工具：
   - **FAQ 页** 把搜索需求接得更完整
   - **相关知识 (Related Knowledge)** 把同主题长尾词全部铺一遍
   - **对比页 (Compare)** "EST vs PST" / "UTC vs GMT" 等
   - **推荐页 (Recommended)** "Best Timer Apps" 等 buyer guide
   - **相关文章 (Articles)** DST 时区科普 / 日出日落天文

## 目录结构

```
src/
├── pages/
│   ├── index.astro                  # 首页：6 层结构（实时钟 → 城市/国家/时区目录 → 工具集 → 高粘性工具 → 长尾主题 → 文章+buyers guides）
│   ├── [city].astro                 # /new-york-city /tokyo /london — 程序化生成的 200+ 城市页
│   ├── countries/index.astro        # 国家列表
│   ├── countries/[country].astro    # /countries/japan /countries/united-states — 80+ 国家页
│   ├── clock.astro                  # /clock — 在线时钟
│   ├── stopwatch.astro              # /stopwatch — 秒表
│   ├── timer.astro                  # /timer — 计时器
│   ├── alarm.astro                  # /alarm — 闹钟
│   ├── countdown.astro              # /countdown — 倒计时
│   ├── calculator.astro             # /calculator — 时间计算器
│   ├── tool/[tool].astro            # /tool/thai-year-converter — 程序化工具页
│   ├── prayer-times/index.astro     # /prayer-times — 伊斯兰祷告时间
│   ├── prayer-times/qibla-finder.astro  # /prayer-times/qibla-finder — 高价值页
│   ├── calendar.astro               # /calendar — 日历
│   ├── holidays.astro               # /holidays — 公共假日
│   ├── on-this-day.astro            # /on-this-day — 历史上的今天
│   ├── sunrise-sunset.astro         # /sunrise-sunset
│   ├── moon-phases.astro            # /moon-phases
│   ├── widget.astro                 # /widget — Free Widgets 落地页
│   ├── api.astro                    # /api — World Time API 落地页
│   ├── premium.astro                # /premium — ad-free 订阅
│   ├── about.astro                  # /about
│   ├── faq.astro                    # /faq
│   ├── learn/[...topic].astro       # /learn/time-zones /learn/daylight-saving-time — 信息页
│   ├── compare/[...slug].astro      # /compare/utc-vs-gmt — 对比页
│   └── articles/[...slug].astro     # /articles/best-alarm-apps — 推荐&buyer guides
├── components/                      # 16 共享组件
├── layouts/Base.astro               # 整站布局（含 header/footer/script）
├── data/                            # 静态数据 (cities.json / countries.json / ...)
├── content/articles/                # 20+ MDX/MD 文章
└── lib/                             # 时区计算 / 日历算法
```

## 页面模板族

| 模板族 | 用途 | 实例数 | 关键内容 |
|---|---|---|---|
| **Homepage** | 流量枢纽 | 1 | 6 层布局 |
| **City** | 城市详情（最高流量）| ~200 | 实时钟 + 信息块 + 关系模块 + FAQ + 相关链接 |
| **Country** | 国家详情 | ~80 | 同上 |
| **Tool** | 强交互工具页 | ~12 | 工具组件 + 说明文 + 内链 |
| **Calculator/Tool (programmatic)** | 长尾工具 | ~50 | thai-year-converter 等 |
| **Learn** | 信息/科普 | ~25 | DST 时区日历天文 |
| **Compare** | 对比 | ~15 | UTC vs GMT / EST vs PST |
| **Recommended/Buyer** | 推荐 | ~10 | Best Timer Apps 等 |
| **Article** | 博客/科普 | ~25 | 长文 |

合计 ≈ 420 页。

## 数据源

- 城市：内置静态 JSON，timezone id 用 IANA tz database（luxon）
- 国家：内置
- 节假日：内置（每国主假期清单）
- 文章：内置 MDX

## 渲染策略

- **静态生成**（Astro SSG）— 所有页面 build 时生成 HTML
- **客户端 islands**：
  - `LiveClock`（每秒更新，1 行 JS）
  - `Stopwatch`/`Timer`/`Alarm`（setInterval + 状态）
  - `Countdown`（Date 差值）
- **无 React/Vue 依赖** — 纯 vanilla JS（最低部署成本，最快加载）

## 反"飘"硬尺

- 单页 ≤ 150 行（首页除外）
- 一次只补 1 类页面，跑完构建再看
- 不混不同类型页模板
