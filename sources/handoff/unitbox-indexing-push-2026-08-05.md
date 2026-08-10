# unitbox 收录与 AI 可见度推进 · 2026-08-05

承接 [[unitbox-cf-robots-unblock-2026-08-05]]（CF 解封）。本轮在解封基础上多管线推进 Google/Bing 收录 + AI 可见度。

## 成果（9 项，全验证通过）

| # | 项 | 证据 |
|---|---|---|
| 1 | CF managed robots 解封 | verify ✅ UNBLOCKED（见 cf-robots handoff）|
| 2 | robots.ts AI 白名单（13 bot 显式 Allow）| alias/robots.txt 白名单生效；线上 verify blocked=false |
| 3 | GSC submit 2 sitemap（修 last_submitted=null）| 204 × 2，Google 几小时内重抓 |
| 4 | ranking 修 ja/ko（5 locale，原 3 locale bug）| dry-run homes=6 articles=70（含 ja/ko）|
| 5 | 推 199 URL Google Indexing API | ok=199 fail=0（含 ja/ko homes/articles/head）|
| 6 | /sitemap.xml → 302 /sitemap-index.xml | alias 返回 302 location（修约定路径返回 HTML）|
| 7 | IndexNow key 根路径文件 /{key}.txt | HTTP 200（修 Bing 严校验 422）|
| 8 | IndexNow 全量推 5736 URL（Bing）| HTTP 200 |
| 9 | prep 脚本 keyLocation 修复 | cron 不再 422 |

## 4 个 bug 真因（都和 memory 旧记录对上 / 纠错）

1. **IndexNow 422**：`KEY="7C26F6F4-B87D-41D5-AC42-A7C48995714F"`（带连字符 UUID）vs keyLocation 文件名 `7C26F6F4B87D41D5AC42A7C48995714F`（无连字符）—— Bing IndexNow 严校验 `{key}` 必须 == keyLocation 文件名。修：`prep` 里 key + keyLocation 都用 `$KEY` 变量，根路径 `/$KEY.txt`。（= memory `unitbox-growth-monitor-stack` 记的"连字符严校验"，今定位精确）
2. **ranking ja/ko 漏推**：`prioritize-indexing.mjs` + `fetch-indexing.mjs` 的 homes/HEAD 循环硬编码 `['/en/','/zh-hans/','/zh-hant/']`，ja/ko 永远排 rest 末尾推不到。修：`LOCALES=['/en/','/zh-hans/','/zh-hant/','/ja/','/ko/']`。（= memory 记的"全花 en"根因）
3. **GSC sitemap submit body**：`{feedpath,feedtype}` 400、`{path}` 400 —— Webmasters API `PUT /sites/{site}/sitemaps/{feedUrl}` 的 feedUrl 在 path param 就够，**body 必须空**（任何字段都 400 "Cannot find field"）。scope 要 `webmasters`（非 readonly）。
4. **wrangler deploy 认证**：`.cf/token`（cfut_）无 Cloudflare Pages Edit 权限（upload-token 403）。用 Global API Key：`CLOUDFLARE_API_KEY + CLOUDFLARE_EMAIL + CLOUDFLARE_ACCOUNT_ID`。

## 新增脚本
- `scripts/submit-gsc-sitemap.mjs` —— GSC sitemap submit（scope=webmasters，空 body）
- `scripts/verify-robots-aibots.mjs` —— CF managed robots 回归监控（exit 1 = 封印回归，可接 cron 告警）

## 下一步信号（盯这些判定 loop 成败）
- **48h**（8/7）：`.observe/2026-08-07/gsc-sitemaps.json` 的 `indexed` 是否 0→N —— Google 真开始索引的拐点
- **7 天**（8/12）：重跑 5 query × 3 engine（ChatGPT/Perplexity/Gemini），unitbox ≥1 cell = AI 可见度突破
- Bing：IndexNow 推完后 1-2 周看 Bing site: 是否从 0 涨

## 可选下个 loop
1. `verify-robots-aibots.mjs` 接进 prep 12h cron（CF managed 回归告警）
2. prep IndexNow 推 ranked 100（现 raw 前 100 = 全 en，没利用 ranking）
3. Bing WMT dashboard 手动验证 site（修 Submit 400，需 dashboard）
4. 源站 `robots.txt.ts` vs `public/robots.txt` 冲突清理（两者同名，靠动态版；白名单已进动态版，public 版冗余可删）
5. 5 篇竞品对比页内容（7-31 baseline 建议 C，2 周工程）
