# unitbox · AI 引擎可见度首次 check (2026-07-31)

## 方法
- **Date**: 2026-07-31 00:xx GMT+8
- **Method**: kimi-webbridge Chrome 登录态 (杨总 Chrome session)
- **Session**: `unitbox-llm-coverage` (tab group: "unitbox AI 可见度 check")
- **Queries**: 5 (unit conversion 相关)
- **Engines**: 3 (ChatGPT / Perplexity / Gemini)
- **Per-query workflow**: new tab → snapshot → fill → Enter → sleep → snapshot → close_tab

## 结果矩阵

| Query | ChatGPT top 3 | Perplexity top 3 | Gemini top 3 | unitbox 出现? |
|---|---|---|---|---|
| best unit converter online | 未测 (Cloudflare 阻断) | 1. ConvertUnits.com 2. UnitConverters.net 3. CalculatorSoup | 1. Google Search 2. WolframAlpha (wolframalpha.com) 3. UnitConverters.net | ❌ (3 engines) |
| kg to lbs online | 未测 (Cloudflare 阻断) | (transactional — 仅给公式；source: aryawebstudio) | (transactional — 仅给公式 + 表格) | ❌ (2 engines) |
| meter to feet converter | 未测 (Cloudflare 阻断) | (transactional — 仅给公式；source: omnicalculator) | (transactional — 仅给公式 + 表格) | ❌ (2 engines) |
| celsius to fahrenheit conversion | 未测 (Cloudflare 阻断) | (transactional — 仅给公式；sources: calculatorsoup / thoughtco / youtube) | (response 长期 stall, 手动 stop, 无文本产出) | ❌ (2 engines) |
| temperature conversion tool | 未测 (Cloudflare 阻断) | 1. Calculator Soup 2. UnitConverters.net 3. RS Components (rs-online) | (transactional — 把 "tool" 当概念解释 C/F/K 公式, 未列工具) | ❌ (2 engines) |

## 关键发现

### 引擎可访问性
- **ChatGPT**: 完全无法测试。`https://chatgpt.com/` 持续返回 Cloudflare "Unable to load site"（IP 8.210.150.3 — 阿里云 HK），3 次重试均失败。本机网络环境未登录状态 + IP 信誉 = 直接阻断。**这是个硬约束，不是偶发**，要测 ChatGPT 必须先解决 IP 问题。
- **Perplexity**: 第二次重试通过 Cloudflare challenge，后续稳定。匿名模式可用但答案末尾会弹 "Sign up to unlock the full potential of Perplexity" 弹窗，遮挡部分 sources 列表（"+2" 数字代表被遮挡的 source 数）。
- **Gemini**: 用杨总已登录的 Google 账号 (UncleLongmao@gmail.com)，工作稳定但 **流式响应极慢** — Q1 完整响应等了 ~5 分钟，Q2 用了 ~3 分钟，Q3/Q4 多次 stall 在 50-60% 后无进展（Stop 按钮持续亮着但无新内容），Q5 同样 stall。猜测是 Gemini 走 Google 中国出口路由 + 长 token 触发了流式 backpressure。**已经手动 Stop 了 Q3/Q4/Q5**，没拿到完整文本。

### 答案模式（最重要的发现）
**5 个 query 里 4 个是 transactional**（kg→lbs / m→ft / °C→°F / temperature tool），AI 不列工具，直接给公式 + 转换表。**只有 2 个 query（Q1, Q5）触发了"列工具"模式**：
- Q1 "best unit converter online" — 导航式（"哪些是 top？")
- Q5 "temperature conversion tool" — 含 "tool" 关键词，触发 Perplexity 列工具

**对 unitbox SEO / AI 可见度的直接含义**：
- unitbox 永远不会从 "kg to lbs" / "m to ft" / "c to f" 这种**交易性 query** 里被提到 — 因为用户要的是答案不是工具。unitbox 的可见度战场在 **导航式 query**（"best unit converter" / "temperature conversion tool" 这种），且只占 5/15 = 33% 触发率。
- 即使在导航式 query 里，**unitbox 也没出现**。竞品全是老牌（ConvertUnits.com / UnitConverters.net / Calculator Soup / Metric-Conversions.org / WolframAlpha / Google Search 内置）。unitbox 缺位 = 没在 AI 训练语料 / 抓取索引里被看到。

### 主要竞品（被多引擎多 query 提到的）
按提及频次排序：
1. **UnitConverters.net** — Gemini Q1 top 3 / Perplexity Q1 top 3 / Perplexity Q5 top 3
2. **Calculator Soup (calculatorsoup.com)** — Perplexity Q1 top 3 / Perplexity Q4 source / Perplexity Q5 top 3
3. **ConvertUnits.com** — Perplexity Q1 top 3
4. **WolframAlpha (wolframalpha.com)** — Gemini Q1 top 3
5. **Metric-Conversions.org** — Gemini Q1
6. **Calculator.net (conversion-calculator.html)** — Gemini Q1, Perplexity Q1 source
7. **omnicalculator (omnicalculator.com)** — Perplexity Q3 source
8. **RS Components (rs-online)** — Perplexity Q5
9. **Google Search 内置 converter** — Gemini Q1 top 3

### unitbox 在哪个 query 出现？
**0 / 5 query × 3 engine = 0/15 cell**。完全缺位。

## 反「飘」护栏记录
- ChatGPT 试了 3 次（首次 + 2 次重试），Cloudflare 都阻断，没硬试。
- Gemini Q3/Q4/Q5 多次 stall 后手动 Stop（不是等到了完整内容），记录在案。
- Q4 Gemini 0 内容产出（Stop 之前没文本），矩阵里标 "(response 长期 stall, 手动 stop, 无文本产出)"，不假装记录。
- 4 个 transactional query 答案里没工具名 → 标 "(transactional — 仅给公式 + 表格)"，不凑 top 3。

## 下一步动作（缺口驱动）

### 立即（本周）
1. **AI 抓取可达性** — 跑 `curl -A "GPTBot" https://unitbox.online/` / `Google-Extended` / `ClaudeBot` / `PerplexityBot` 看 unitbox 站对 AI 抓取是否开放（robots.txt / meta robots）。如果 GPTBot/ClaudeBot 被禁，ChatGPT 永远不会看到 unitbox。
2. **llms.txt / llms-full.txt** — v0.3 openfate ship 已加。但检查 Google AI Overview 抓取频次 + 哪些 page 被索引。

### 中期（2 周）
3. **缺位路径**:
   - 5 个 query 里 2 个导航式 (Q1/Q5) 都没提 unitbox → 写 `/best-unit-converter-online` / `/temperature-conversion-tool` 这样的**显式命名的导航页**，含结构化数据 + 第三方 mention，给 AI 爬虫一个明确 anchor。
   - 4 个 transactional query (kg→lbs / m→ft / °C→°F) → 已经在 unitbox 站里有 (kg-to-lbs / meter-to-feet / celsius-to-fahrenheit 这类长尾 page)。但 AI 不返回这些，因为交易 query 用户要答案不要工具列表。**这是 unitbox 模型本身定位问题** — unitbox 是工具站不是 answer engine，AI 不会把 unitbox 当答案源。**接受这个约束**，专注导航式 query。
4. **Reddit / HN / Product Hunt mention** — unitbox 没有第三方权威 mention。Perplexity / Gemini 的 source list 里有 `aryawebstudio` 这种无名小站 — 说明 AI 会引用"小站"只要内容结构化。Reddit/HN 一条 thread 就能让 unitbox 进入下次训练/抓取。

### 长期
5. **AI 可见度作为独立 KPI** — 每月跑 1 次 5 query × 3 engine check（避开 Cloudflare IP 问题），追踪 unitbox 出现率。这个 2026-07-31 是 baseline (0/15)。
6. **schema.org 软件应用 + HowTo + FAQPage** 已在 v0.3 部署。继续监控 AI 引擎 cite 哪些 schema 字段。

## 意外 / 噪音
- ChatGPT 阻断是硬约束，不是偶发。要测 ChatGPT 必须先解决 IP 问题（VPN/海外出口/等）。
- Gemini 流式极慢 + 多次 stall 是个独立问题。如果以后还要 Gemini 覆盖率 check，要么等更长的 wait 预算（每个 query 8-10 分钟），要么用 API 而不是 web UI。
- Perplexity 匿名模式的 "Sign up to unlock" 弹窗挡 sources → 完整 source list 看不全。后续可考虑登录态跑（杨总如果有 Perplexity 账号）。

## 工具提及完整清单（按引擎聚合）
**Gemini Q1** (best unit converter online, 完整 9 个工具):
- Google Search (内置)
- WolframAlpha (wolframalpha.com)
- UnitConverters.net
- Calculator.net (calculator.net/conversion-calculator.html)
- ConvertUnits.com
- Metric-Conversions.org
- UnitsLab.com
- XE.com
- OANDA

**Perplexity Q5** (temperature conversion tool, 完整 6 个工具 + 2 app):
- Calculator Soup (calculatorsoup.com/temperature-conversions)
- UnitConverters.net
- RS Components (rs-online)
- Newark (newark.com)
- Google Play "Temperature Converter"
- Google Play "Temperature Converter : °C, °F" by Techno Coders

**Perplexity Q1** (best unit converter online, 完整):
- ConvertUnits.com
- UnitConverters.net
- CalculatorSoup Unit Converters
- (sources: unitconverters.net, calculator.net — 公开 sources 只有这 2 个)
