# unitbox 域名战略 handoff · 给 ChatGPT 二次分析用

> **Date**: 2026-07-31
> **Author**: 杨总 (one-person AI native co) + main session (minimax M3)
> **Purpose**: 让 ChatGPT 给第二意见 (validation / push back / 盲点)
> **状态**: v0.4 已 ship · 公开 GitHub repo 已 push · Reddit launch post 被 auto-filter · AI 引擎可见度 0/15 · 域名战略未定

---

## 1. Context (背景)

### 杨总是什么人
- 一人公司 (mini CTO + 产品 + 增长三合一)
- 路线: AI Native,独立开发,工具站 + iOS indie + 投资
- 决策风格: loop engineering (假设→最小实验→证据→判定→沉淀),海信 3 bar (≤100 行 spec / 一次修 1 / 跨模型对抗),**已同意不回头再确认**,可直接做但破坏性动作要确认

### unitbox 是什么
- **程序化 SEO 工具站**: 围绕 unit conversion 这个高搜索量品类,做 1135 个 `meter-to-feet` 风格的工具页 + 109 个 unit 详情页 + 14 篇文章 + 9 个对比页 + 12 分类索引页
- **v0.4 ship** (2026-07-30): 3 locale (en/zh-hant/zh-hans) × 3408 HTML · 102 BDD test · hreflang+canonical · opencc-js cn→tw · PNG compressor (client-side viral tool) · OpenAPI 3.0 spec × 3 · llms.txt × 3 · JSON-LD 5 类型 (WebSite/Organization/SoftwareApplication/FAQPage/HowTo) · sitemap-0.xml
- **定位**: "open-source unit conversion engine for AI Agents" (核心 hook,写了 README 第一行 + OpenAPI description)
- **变现路径**: ¥12 buy unit pair (着陆页已就位)
- **公开 GitHub repo**: `github.com/longmao/yang-unitbox-engine` (MIT, 24 files, 130.7 KB, 6 specs × 3 locale + i18n + conversions + PNG compressor)

### 7/31 当晚三动作结果
- ✅ GitHub repo push 成功 (longmao/yang-unitbox-engine)
- ⚠️ Reddit r/SideProject post 提交后 1 upvote 即被 auto-filter (新账号+多外链+promotional tone 4 命中组合)
- ❌ AI 可见度 check 5 query × 3 engine = **0/15 缺位** (ChatGPT Cloudflare 阻断 / Gemini 多次 stall / Perplexity 工作),竞品全是 UnitConverters.net / CalculatorSoup / ConvertUnits.com / WolframAlpha / Metric-Conversions.org

---

## 2. 域名问题 (核心要 ChatGPT 评的)

### 4 TLD 实测现状 (whois + curl 直查)

| TLD | 注册 | 过期 | HTTP 状态 | 内容 | 获取难度 |
|---|---|---|---|---|---|
| **unitbox.com** | 2004-10-10 (22 年) | 2027-10-10 | 200 | Webflow 产品站,22 年老域名,有真实 owner | ❌ 极高 ($5k-50k) |
| **unitbox.io** | 2022-01-14 | 2027-01-14 | 200 | "UNITBOX DAO" — NFT rental GameFi 项目,GitHub+social presence | ❌ 高 ($3k-15k,加密项目多半不卖) |
| **unitbox.dev** | 已注册 | n/a | 000 (parked) | 无内容 | ⚠️ 中 ($30-200 二手市场) |
| **unitbox.app** | 已注册 | n/a | 000 (parked) | 无内容 | ⚠️ 中 (同上) |
| **unitbox.online** (当前) | 已注册 | 续费中 | 200 | unitbox 主站 live | 已有 |

### 当前域名 `.online` 的硬伤 (杨总自己写的)
1. **SEO 起跑线输** —— 新 gTLD,CTR/链接信任度长期偏低
2. **品牌信任输** —— 用户心智默认归类"小作坊/个人项目",付费场景降权
3. **记忆/口碑输** —— 口碑传播时人脑默认补全 .com,手滑流失

### unitbox 名字本身 (杨总评分)
- B+ (7 字母双词,unit + box 组合,画面感强)
- 唯一问题: /tb/ 辅音连缀,口语传播略糊
- 6 个可挂方向: DevOps 工具 / 单位换算 (✅ 当前) / 仓储 SKU / 房源单元 / 健身单位 / 盲盒订阅

---

## 3. 三个备选路径 (杨总已给出,待 ChatGPT 评)

### A 档 · 推荐：**不换 + 防身**
- 维持 `.online` 主域名,**零迁移成本**
- backorder `.dev` 和 `.app` ($30-200) → 永久 301 redirect 到 .online (防 typosquat + 品牌保护)
- 接受 `.online` 的 5-10% 转化率折损,用开源 repo + llms.txt + AI 可见度 30 天 plan 补回
- **年成本**: $25-40 续费 + $30-200 一次性防身

### B 档 · 折中：**整体迁移到 .dev**
- 假设能抢到 `unitbox.dev` ($30-200)
- 迁移成本 = 301 + sitemap 重提 + GitHub Pages 域名换 + Reddit post 改 + OpenAPI baseUrl 换 + llms.txt 改 = **~10-20 小时人时**
- 收益 = `.dev` 对开发者群体信任度明显高于 `.online` (Chrome HSTS preload 强绑定)
- **ROI**: 中 — 改 10-20h 但只改善 L2 信任 5-15%

### C 档 · 不建议：**抢 .com / .io**
- `.com` 22 年老 + Webflow 产品 → 3-6 月谈判 + $5k-50k
- `.io` 加密 DAO → 多半不卖 (品牌是唯一资产)
- 直接放弃

---

## 4. 关键约束 / 护栏 (ChatGPT 给意见时请尊重)

1. **一人公司** —— 决策时间预算每周 ≤ 5 小时域名相关,**不要推荐耗时 ≥ 20 小时的方案** (除非 ROI 明确 ≥ 10x)
2. **杨总决策风格** —— "已同意不回头再确认";不需要 ChatGPT 把所有可选路径都列一遍,**直接给 1 个推荐 + ≤ 2 个反对意见即可**
3. **不囤域名** —— 杨总对"投资品"型域名兴趣低 (per 他自己的 §5 "不建议囤 .online 等升值"),ChatGPT 不要劝他买 .com 等升值
4. **数据优先** —— 不要重复已经测过的 (whois 数据已拉过,4 TLD 真实状态都摆上面),**请给新维度分析**
5. **loop 工程视角** —— 任何建议都要带"假设→机制→最小实验→证据→判定",纯理论建议被打回

---

## 5. 已有 anchor (ChatGPT 不必再生成)

| 主题 | 文件 |
|---|---|
| unitbox 完整 ship log (v0.2 → v0.4 + AI baseline) | `topic-unitbox-ships.md` |
| wechat-seo-trust-article 4 件套方法论 | `wechat-seo-trust-article-2026-07-30.md` |
| AI 可见度 baseline (0/15) | `unitbox-ai-coverage-baseline-2026-07-31.md` |
| 杨总 loop 工程总纲 | `loop-engineering.md` (在 ai-fleet/method/LOOP_ENGINEERING.md) |
| 海信 Qoder 3 bar | `harness-essay-takeaways.md` |

---

## 6. 给 ChatGPT 的问题清单 (按优先级)

1. **A 档防身是否足够?** backorder `.dev`+`.app` 是 good-enough 防御还是 too little too late? 有无更便宜的"品牌统一"路径?
2. **.online 5-10% 转化折损 这个估计准吗?** 有无公开数据 (Cloudflare Radar / SimilarTech / 域名行业报告) 能 refine 这个数字?如果实际是 15-25%,B 档 ROI 是否就翻正了?
3. **.io DAO 项目** —— 杨总没去测过他们愿不愿意让出品牌 (毕竟"unitbox" 是英文通用词不是他们造的)。**有没有低成本探口风的路径**?例如: 是不是值得花 1 小时发邮件试探 $5-10k 收购意愿?
4. **盲点**: 我和杨总都没考虑到的因素? (例如: HTTPS cert 续费周期、ICANN 转移锁、域名年龄对 SEO 的隐性影响 等)
5. **如果只能做一件事**: 杨总下周 5 小时该花在哪? (域名 / AI 可见度 30 天 plan / HN Show HN / 其他)

---

## 7. 输出格式期望

- 中文优先 (杨总中文主)
- ≤ 800 字主体 + 编号回答 6 个问题
- 推 1 个最终推荐 (≥ 80% 置信度),附 ≤ 2 个反对意见
- 不要重复我们已测的数据 (whois / curl 状态)
- 不要劝买 .com 等升值
- 带 1 行 loop 视角总结 (假设 / 最小实验 / 判定)