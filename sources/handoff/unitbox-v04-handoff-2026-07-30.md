# unitbox v0.4 handoff — independent verification

> 给杨总另一台 agent（或杨总本人）独立验收用。完全 self-contained，可以 clone project 直接跑。

## Context（一段）

`/Users/vincent/work/experimental/unit-now` 是一个 Astro 4 SSG 单位换算网络。原 v0.3 已经 ship（brand unitbox / 1136 HTML / client-side i18n toggle / SEO 全栈）。v0.4 把 i18n 从 client-side toggle 翻到 **locale-prefix routing × 3 locales**（en / zh-hant / zh-hans），并新增唯一 viral tool：**PNG compressor**（纯客户端 canvas，3 locale 落地）。

预期产出：
- **3411 HTML pages**（1135 pair × 3 + 109 unit × 3 + 12 category × 3 + 8 learn × 3 + 14 articles × 3 + 9 compare × 3 + 9 page-level × 3 + 3 PNG compressor）
- **135 BDD tests** 全 pass
- **每页 4 hreflang**（en / zh-Hant / zh-Hans / x-default）
- **`<html lang>` per locale**
- **canonical per locale**

## 5 段式 handoff

### 1. 已完成

| Block | 内容 | 验证 |
|------|------|------|
| A.1 | i18n dict 拆分：`src/lib/i18n.ts` → `src/lib/i18n/{locales,en,zh-hant,zh-hans,index,routes}.ts` + opencc-js 自动生成 zh-hant | BDD 17/17 pass（key 一致性 + t/tFmt/formatNumber/formatDate） |
| A.2 | 11 page 文件 mv 到 `src/pages/[locale]/`，每 page `getStaticPaths` × 3 locales | astro check 0 errors |
| A.3 | `src/layouts/Base.astro` 重写：locale prop + 4 hreflang + canonical per locale + URL-based lang switcher（删 `window.__I18N__` / localStorage / `data-i18n`） | grep `rel="alternate" hreflang` 4/page |
| A.4 | `public/_redirects`：root + 旧 locale 缩写 + 旧 llms/openapi 301 | ls `dist/_redirects` |
| A.5 | `public/llms.{en,zh-hant,zh-hans}.txt` + `public/openapi.{en,zh-hant,zh-hans}.json`（zh-hant 通过 opencc-js 从 zh-hans 生成） | ls dist × 3 + 3 |
| B | PNG compressor：`src/pages/[locale]/tools/png-compressor.astro` + `src/components/PngCompressor.astro` + 30 i18n key × 3 + SoftwareApplication/FAQPage/HowTo schema + footer Products 列首位 | BDD 33/33 pass |

### 2. 怎么验证（命令清单）

按顺序跑，全应 pass：

```bash
cd /Users/vincent/work/experimental/unit-now

# (1) astro type check（不需要 dist）
npx astro check

# (2) i18n dict consistency BDD（不需要 dist，src/lib/i18n/ 单元测试）
npx vitest run src/lib/i18n/

# (3) fresh production build（必须先有 dist，PNG BDD 才能 read dist HTML）
rm -rf dist && npm run build

# (4) full BDD（135 tests；33 个读 dist/*.html，无 dist 会 ENOENT fail）
npx vitest run

# (5) dist sanity
echo "HTML pages: $(find dist -name 'index.html' | wc -l | tr -d ' ')"
echo "sitemap URLs: $(grep -c '<loc>' dist/sitemap-0.xml)"
echo "PNG compressor pages: $(find dist -name 'index.html' -path '*tools/png-compressor*' | wc -l | tr -d ' ')"
echo "llms.txt × 3: $(ls dist/llms*.txt 2>/dev/null | wc -l | tr -d ' ')"
echo "openapi × 3: $(ls dist/openapi*.json 2>/dev/null | wc -l | tr -d ' ')"
ls dist/_redirects 2>/dev/null && echo "_redirects present ✓"

# (6) hreflang + canonical + html lang + schema spot check
echo "html lang /en/meter-to-foot/: $(grep -oE '<html[^>]+>' dist/en/meter-to-foot/index.html)"
echo "html lang /zh-hant/meter-to-foot/: $(grep -oE '<html[^>]+>' dist/zh-hant/meter-to-foot/index.html)"
echo "hreflang count /en/meter-to-foot/: $(grep -oE 'rel=\"alternate\" hreflang=' dist/en/meter-to-foot/index.html | wc -l)"
echo "canonical /zh-hant/meter-to-foot/: $(grep -oE '<link rel=\"canonical\"[^>]+>' dist/zh-hant/meter-to-foot/index.html)"

# (7) bugs that should be ZERO
echo "unitbox.online// double-slash: $(grep -c 'unitbox.online//' dist/sitemap-0.xml)"
echo "brackets in sitemap: $(grep -cE '\[|%5B|%5D' dist/sitemap-0.xml)"
echo "unit.now residual: $(grep -r 'unit\.now' dist/ --include='*.html' | wc -l | tr -d ' ')"

# (8) PNG compressor spot check
echo "PNG compressor /en/ has 3 pills: $(grep -oE 'class=\"pill\"' dist/en/tools/png-compressor/index.html | wc -l)"
echo "PNG compressor /zh-hans/ has SoftwareApplication: $(grep -oE 'SoftwareApplication' dist/zh-hans/tools/png-compressor/index.html | wc -l)"
```

### 3. 期望值

| 检查项 | 期望 | 失败判定 |
|--------|------|----------|
| vitest | 4 files, 135 tests passed | 任何 fail |
| astro check | 0 errors / 0 warnings / ≤7 hints (pre-existing unused vars) | 任何 error |
| HTML pages | 3411 | <3400 |
| sitemap URLs | 3411 | <3400 |
| PNG compressor pages | 3 (en/zh-hant/zh-hans) | != 3 |
| llms.txt × 3 | 3 | != 3 |
| openapi × 3 | 3 | != 3 |
| `_redirects` | present | missing |
| html lang /en/ | `<html lang="en"` | wrong |
| html lang /zh-hant/ | `<html lang="zh-Hant"` | wrong |
| html lang /zh-hans/ | `<html lang="zh-Hans"` | wrong |
| hreflang per page | 4 | < 4 |
| canonical per locale | per-locale URL | cross-locale |
| double-slash bug | 0 | > 0 |
| brackets in sitemap | 0 | > 0 |
| unit.now residual | 0 | > 0 |
| PNG pills × 3 locale | 3 pills each | != 3 |
| PNG SoftwareApplication × 3 locale | 1 each | 0 |

### 4. 已知 gotcha（不要 flag 为 bug）

- **astro check 5 hints**：pre-existing unused variable warnings（`i` 在 `.map((seg, i) =>` 未用 + `m` 在 build-zh-hant.mjs 未用）。不是 v0.4 引入，是 ship 前就存在。`astro check` summary 里可能显示 17 vs 6 的差，是 Astro 内部虚拟文件诊断重复计数；以 0 errors 为 PASS 唯一标准，hint 数不卡。
- **`grep -c` 是行数陷阱（关键！）**：minified HTML 所有 `<script>` 都挤在一行，`grep -c 'application/ld+json'` 返回 1 不是 5。**永远用 `grep -oE ... | wc -l` 数 tag occurrence**。这条会反复咬人，已记到 memory。
- **Function name minified**：dist HTML 中 PNG compressor 的 `compressFile` / `renderItem` 等函数名被 minify 成 `E` / `g`。BDD test 用 `createImageBitmap` / `canvas` / `toBlob` / `image/png` 这种 global API 验证，不依赖函数名。
- **`data-i18n` JSON attribute HTML-encoded**：quote `&quot;` 不是 `"`。grep pattern 要用 `&#34;`。
- **PNG compressor page 的 5 个 JSON-LD block**：是 WebSite/Organization(1 graph) + BreadcrumbList + SoftwareApplication + FAQPage + HowTo。每页 5 个 `<script type="application/ld+json">` 标签。**用 `grep -oE 'application/ld\+json' file | wc -l` 数**，不要 `grep -c`。
- **hreflang 共 7 不是 4**：`<link rel="alternate" hreflang=...>` 是 4（head meta），`<a href="..." hreflang=...>` 在 nav 语言切换器里又有 3。验收表格只数 head link 的 4，是对的。粗 grep `hreflang=` 会看到 7，不要 panic。
- **Build time ~3-8s**：3 locales × Astro 4 SSG 线性预期，不要 flag 慢。3411 页实测 ~8s。
- **dist 132M**：v0.3 = 54M × 2.4 = 132M（3 locales 是原因）。可优化但不是 ship blocker。

### 5. 决策点（如 verification 失败怎么办）

1. **i18n dict key 不一致** → 跑 `node scripts/build-zh-hant.mjs` 重新生成 zh-hant.ts（从 zh-hans.ts 经 opencc-js cn→tw 转换）。
2. **astro check 出现新 error（不是 hint）** → 看 error 位置，对应 page 文件缺 `getStaticPaths` locale loop 或 Base.astro 缺 `locale` prop。
3. **hreflang count < 4** → 检查 Base.astro 的 `{hreflangs.map(...)}` 块和 `hreflangTags()` 函数（`src/lib/i18n/routes.ts`）。
4. **canonical cross-locale**（/zh-hant/ 指向 /en/）→ 检查 `canonicalUrl(Astro.url.pathname)` 是否直接用 pathname，未 strip locale。
5. **PNG compressor script 不在 dist** → 检查 `src/components/PngCompressor.astro` `<script>` 块是否在文件里、Astro build 是否报错。
6. **astro build 失败** → `npm install` 检查 deps 是否齐（特别是 `opencc-js`）。

## Memory 参考（先读这两条再开跑）

- `/Users/vincent/.claude/projects/-Users-vincent/memory/unit-now-v04-i18n-locale-prefix-ship-2026-07-30.md` — Block A 完整 ledger
- `/Users/vincent/.claude/projects/-Users-vincent/memory/unitbox-png-compressor-v040-ship-2026-07-30.md` — Block B 完整 ledger
- `/Users/vincent/.claude/projects/-Users-vincent/memory/astrojs-sitemap-astro4-crash-2026-07-30.md` — sitemap post-build 脚本为何存在（reference 必读）
- `/Users/vincent/.claude/projects/-Users-vincent/memory/cross-session-handoff-prompt.md` — handoff 模板来源

## 期望回报格式

verification agent 请回报：
- ✅/❌ 每条 3-段验证清单
- 任何 deviation 给 file:line 定位
- 截图或 text dump（如有 visual anomaly）
- 总耗时

不要 verify deployment（domain 还没买）—— 仅 verify dist + test + build。