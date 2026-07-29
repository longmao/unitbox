# unit-now

> **角色**: 程序化 SEO 工具站 #2（time-now-clone 的同构 fork） · **状态**: active (v0.1) · **入口**: `README.md` / `src/pages/index.astro` · **跟谁相关**: 工具站矩阵（time-now-clone 同架构）

完整 work/ 索引见 [WORK_INDEX.md](../../WORK_INDEX.md)

## 是什么
基于 [`time-now-clone`](../time-now-clone/) 的页面网络模板 fork 出来的单位换算站样板。把"围绕一个主题的页面网络"这套打法，换到一个**纯本地计算、强 SEO 长尾、可无限扩展**的赛道（单位换算）。

**v0.1 架构（1135 页 · 12 分类 × ~10 单位 + 自动组合的换算对页）**

- 12 类别：length / mass / temperature / area / volume / speed / time / data / energy / pressure / angle / fuel-economy
- 105 单位（categories.json + units.json 静态数据，零网络依赖）
- 105 单位详情页 (`/meter` `/kilogram` 等)
- 105×~9 上下文的换算对页 (`/meter-to-feet` 等，约 950+ URL)
- 1 个万能计算器页 (`/calculator`)
- 12 个分类索引页 (`/category/length` 等)
- 14 篇长文（articles · 通过 `formatInline` 支持 `**粗体**` `*斜体*` ``code`` `[链接](url)` `$$公式$$`）
- 8 篇深度学习页（learn）
- 8 篇对比页（compare）

**核心三方数学：**
- **linear**: `value × fromFactor ÷ toFactor`（length/mass/area/volume/speed/time/data/energy/pressure/angle）
- **affine**: `value × slope + offset` → 反向 `(base − toOff) ÷ toSlope`（temperature: C/F/K/R/Ré）
- **reciprocal**: 通过 L/100km 中间值，互为倒数（fuel-economy: MPG ↔ L/100km）

## 怎么用
```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # 1135 页 → dist/ (≈1.1s)
npm run preview
```

整站跑在静态 `dist/` 目录，可以直接 `python3 -m http.server` 起来，或者丢到任何静态 host（Netlify / Cloudflare Pages / BunnyCDN Static）。

## 边界 & 已知 follow-up
- **纯前端 / 零网络**：所有换算离线可算，对纯 SEO 站是最大优势
- **inline markdown 解析**：`src/lib/format.ts` 手卷了一个 50 行的小引擎，支持粗体/斜体/code/链接/数学块；如果以后内容规模扩到 100+ 篇再考虑换 remark
- **页面发现**：sitemap.xml 桩位（@astrojs/sitemap 在 catch-all 路由下崩的老问题，time-now-clone 同样）
- **Webfont** 走 bunny.net Inter 全字重（同样未子集化）
- **fuel-economy 单位对换**：MPG ↔ L/100km 必须互过中间值，不是线性乘一个 factor；lib 已经按 reciprocal 处理
- **temperature**：K vs C 同 size 不同零；C vs F 同 size 不同零；所有都已经在 `convert()` 里走 affine 分支
- **v0.2 候选**：sitemap.xml 重建、/api JSON endpoint、PWA install hint、search 框

## 战略价值
`time-now-clone` 把"页面网络"这套模板 fork 出来的成本 ≈ 30 分钟（fork + 数据替换 + 路由命名 + 模板套用）。这把同样的思路套到了单位换算这个**纯本地计算 + 全球搜索量极大**的赛道——理论上可以再 fork 出第三站（颜色转换 / 货币换算 / 坐标系转换等）。

## cross-project 参照
- 同架构样板：[`../time-now-clone/`](../time-now-clone/) — 441 页 time.now clone，本 fork 的源头
- 反"飘"硬尺：所有 type-check / build / JS 错误都在 ship 前修完；CSS scoping 坑从 time-now-clone 学到（utility class 走 global.css，组件 scoped 只到自身）
