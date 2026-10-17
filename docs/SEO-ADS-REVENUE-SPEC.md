# unitbox SEO 与广告变现实施 Spec

版本：v0.1  
日期：2026-10-17  目标：2026-10-31 前上线广告并争取产生第一笔可验证收入

## 1. 目标与现实边界

### 1.1 目标

把 unitbox 从“可用的单位换算工具”推进成“可持续获取搜索流量的工具内容站”，并完成第一阶段广告变现：

```text
技术 SEO 修复 → 高意图落地页 → Search Console 收录 → 广告接入
                                                ├→ 展示/点击收入
                                                └→ 直接赞助/开发者合作收入
```

### 1.2 不能承诺的事项

- AdSense 审核时间和是否通过不由代码控制，因此“月底前产生收入”不能只依赖 AdSense。
- 如果 AdSense 在月底前尚未通过，必须用直接赞助位、开发者赞助或 API 合作作为收入兜底。
- 不通过刷流量、自点广告、激励点击、弹窗或误导性广告获取收入。

Google 官方要求网站拥有原创、有价值的内容、清晰导航和良好用户体验；广告不能被设计成导航、按钮或内容链接，也不能诱导点击。[AdSense 页面准备要求](https://support.google.com/adsense/answer/7299563)，[广告位置政策](https://support.google.com/adsense/answer/1346295)

## 2. 当前站点审计结论

已检查线上首页、分类页、转换页、文章页、robots.txt 和 sitemap：

- 已有静态 HTML、canonical、hreflang、Open Graph、JSON-LD、FAQ、robots.txt 和 sitemap，SEO 技术基础合格。
- 已有 `/en/category/length/` 分类页、`/en/meter-to-foot/` 配对页和文章页模板，适合继续做程序化 SEO。[长度分类页](https://unitbox.online/en/category/length/)，[米转英尺页](https://unitbox.online/en/meter-to-foot/)，[文章页](https://unitbox.online/en/articles/)
- 首页、meta description 和 JSON-LD 中的单位/配对数量存在不一致，必须统一为同一数据源生成。
- sitemap 当前大量 URL 使用相同的 `lastmod`，需要改为页面实际内容更新时间。
- 当前页面未发现 AdSense 广告容器；需要增加可开关的广告组件和 `ads.txt` 配置。
- 网站同时放置单位换算、PNG、JWT、取色器和 Apple Dev 内容；第一阶段以单位换算为主，Apple Dev 需要隔离或降权，避免主题稀释。

## 3. 产品定位

主定位：

> Fast, accurate unit conversion tools for everyday users, engineers and AI agents.

中文解释：面向普通用户、工程师和 AI 工具的快速、准确单位换算平台。

### 3.1 内容优先级

| 优先级 | 内容 | 目标 |
|---|---|---|
| P0 | 高意图单位配对页 | 承接 `kg to lbs`、`psi to bar` 等搜索 |
| P0 | 分类页 | 组织内链、承接类别搜索 |
| P1 | 工程/建筑/烹饪/数据场景页 | 提高长尾覆盖和页面停留 |
| P1 | 公式、表格、FAQ 和方法论 | 提升独立价值与 AdSense 审核质量 |
| P2 | API、npm、GitHub、LLM 文档 | 获得开发者反向链接和 B2B 合作 |
| P2 | Apple Dev | 暂时不作为 unitbox 主站 SEO 重点 |

## 4. SEO 技术改进

### 4.1 单一数据源

从 `src/data/categories.json`、`src/data/units.json` 和配对数据自动生成：

- 首页统计数字
- meta description
- JSON-LD description
- 分类页数量
- sitemap URL 和 lastmod
- footer 的热门转换列表

禁止在模板中手写 `100+`、`110+`、`1,019`、`1,135` 等容易过期的数字。

### 4.2 页面模板要求

每个转换页必须包含：

1. 唯一 `<title>`：`{from} to {to} converter — unitbox`。
2. 唯一 meta description，包含转换方向和工具价值。
3. 一个清晰 H1。
4. 可立即使用的转换器。
5. 公式和单位定义。
6. 10–20 行常用值表。
7. 至少 3 个常见问题。
8. 同类转换、反向转换、分类页和文章内链。
9. JSON-LD：`WebApplication`、`FAQPage` 或适用的 `BreadcrumbList`。
10. 页面最后更新时间和错误反馈入口。

页面不能只输出换算结果；必须提供公式、解释、表格和相关路径，避免大量薄内容页面。

### 4.3 新增高意图页面

首批优先覆盖：

- `mm to inch`、`inch to mm`
- `kg to lbs`、`lbs to kg`
- `psi to bar`、`bar to psi`
- `kW to hp`、`hp to kW`
- `Nm to lb-ft`、`lb-ft to Nm`
- `mAh to Wh`、`Wh to mAh`
- `oz to grams`、`grams to oz`
- `cups to ml`、`ml to cups`
- `acres to hectares`、`hectares to acres`
- `km/L to MPG`、`MPG to L/100km`

### 4.4 场景页

先新增 5 个高质量专题页，而不是一次批量生成几十个空壳页面：

- `/en/construction-unit-converter/`
- `/en/engineering-unit-converter/`
- `/en/cooking-unit-converter/`
- `/en/data-storage-converter/`
- `/en/fuel-economy-converter/`

每页包含场景说明、推荐单位、常见转换、公式、FAQ 和对应配对页链接。

### 4.5 国际 SEO

- 保留英文为主语言，确保 `/zh-hans/`、`/zh-hant/`、`/ja/`、`/ko/` 的 title、description、H1 和 FAQ 不是机械直译或空页面。
- 每个翻译页只指向对应语言 canonical，并正确输出 hreflang。
- 优先完善简体中文的高意图页，因为其搜索场景和英文不同：英寸厘米、公斤斤、平方米亩、华氏摄氏度等。

## 5. 广告集成设计

### 5.1 Provider 抽象

新增 `src/components/AdSlot.astro` 和配置层：

```ts
type AdProvider = 'none' | 'adsense' | 'direct';

interface AdConfig {
  provider: AdProvider;
  publisherId?: string;
  enabled: boolean;
  pageTypes: string[];
}
```

默认 `provider=none`，没有合法 publisher ID 时不输出广告脚本，避免把占位符发布到生产环境。

### 5.2 AdSense 接入

接入条件：

- 站点已在 AdSense 中添加并验证。
- 可访问页面 HTML，并能在 `<head>` 中放置官方脚本。[站点所有权要求](https://support.google.com/adsense/answer/91205)
- 发布者 ID、付款资料、隐私政策、条款和联系页面已准备好。
- `public/ads.txt` 使用 AdSense 控制台提供的真实 publisher ID；不提交示例 ID。[官方 ads.txt 说明](https://support.google.com/adsense/answer/7584263)

实施方式：

```astro
{ads.enabled && ads.provider === 'adsense' && (
  <AdSlot placement="after-result" format="auto" />
)}
```

只允许在服务端/构建时注入 publisher ID，不能让 URL 查询参数或用户输入控制广告配置。

Google Auto ads 支持页面排除、广告数量、最小间距、锚定广告、侧边广告和插页广告控制。[Auto ads 设置](https://support.google.com/adsense/answer/9305577)

### 5.3 广告位置

#### 转换工具页

- `after-result`：转换结果下方，首选位置。
- `before-faq`：公式、表格和 FAQ 之间。
- 桌面端右侧 `side-rail`：仅宽屏显示。

#### 文章页

- 标题/导语之后。
- 文章正文中部。
- FAQ 之前。

#### 明确排除

- 输入框、单位选择器和 Swap 按钮附近。
- 主要 CTA、下载按钮和复制按钮旁边。
- 404 页、隐私政策、条款、API 纯文档页。
- 可能成为私人通信或用户输入主要内容的页面。

广告必须明显区别于导航和正文，不使用“帮助”“推荐资源”等误导性标题，不使用“请点击广告”等文案。Google 明确禁止诱导点击、伪装成内容和自动刷新广告。[广告位置政策](https://support.google.com/adsense/answer/1346295)

### 5.4 AdSense 审核期间的收入兜底

因为 AdSense 审核结果和时间不可控，月底前同时准备一个直接赞助方案：

- `Sponsored developer tools`：面向开发者工具、API、软件服务商。
- 固定月度赞助位：文章页或 API 文档页，明确标注 `Sponsored`。
- API/工具合作：赞助方获得文档页 logo 和链接，必须人工审核。

直接赞助不使用 AdSense 代码，不诱导用户点击，不伪装为自然搜索结果。价格和合作条款由人工确认。

## 6. 广告组件验收标准

- 未配置 publisher ID 时页面无广告脚本、无空白大容器、无控制台错误。
- 配置 `ADS_PROVIDER=adsense` 且有 ID 时，只有允许的 page type 输出广告。
- 广告位有固定最小高度，降低 CLS。
- 移动端不遮挡输入框和转换结果。
- 广告加载失败不影响转换器、表格和 FAQ。
- 页面源码不出现 `ca-pub-000...` 等示例值。
- `ads.txt` 可通过 `https://unitbox.online/ads.txt` 访问。
- build 后检查没有未替换的环境变量。

## 7. 数据和指标

### 7.1 SEO 指标

- Google Search Console：已发现 URL、已编入索引 URL、展示、点击、平均排名。
- Bing Webmaster：索引和查询词。
- 每个模板族的 indexed/valid/error 数量。
- 转换器使用次数、结果复制次数、页面停留和回访。

### 7.2 广告指标

- ad request
- impressions
- viewability
- RPM
- CTR
- estimated earnings
- 页面类型和位置表现

首期只统计聚合指标，不记录用户输入的具体数值，不建立跨站用户画像。保留现有“no tracking”产品承诺时，必须在隐私政策中明确广告/测量服务的变化，并按实际使用的地区法规选择 consent 方案。

## 8. 10 月底倒排计划

### 10/17–10/18：修复基础 SEO

- 统一站点统计数字。
- 修复 title、description、JSON-LD 的不一致。
- 让 sitemap 使用真实 lastmod。
- 审核 canonical/hreflang/robots。
- 清理 Apple Dev 在首页的突出展示。
- 确保 Privacy、Terms、About、Methodology、Contact 可访问。

### 10/19–10/21：扩展高意图页

- 上线首批 20 个高意图转换页。
- 上线 5 个场景页。
- 为每个新页补 FAQ、公式、表格和内链。
- 运行 `npm run build` 和死链检查。

### 10/22–10/23：接入广告基础设施

- 添加 `AdSlot.astro`、配置读取和 feature flag。
- 添加广告位样式和 CLS 保护。
- 准备 `ads.txt` 模板。
- 申请/提交 AdSense 站点审核（如果账号条件已具备）。
- 同步准备直接赞助页和报价说明。

### 10/24–10/26：提交和推广

- 提交 sitemap 到 Google Search Console 和 Bing Webmaster。
- 请求优先收录新增高价值页。
- 发布 3 篇原创文章。
- 在 GitHub README、npm 文档和开发者社区发布 API 使用示例。
- 联系至少 10 个潜在工具/API赞助方。

### 10/27–10/31：上线收益验证

- 开启少量 AdSense 位置，先从文章页和结果下方开始。
- 检查广告策略、页面体验、移动端布局和错误日志。
- 发布赞助位页面并争取首个直接合作。
- 每日记录展示、点击、RPM、收入和索引变化。
- 依据数据关闭低收益、高干扰广告位。

## 9. 验收标准

### SEO

- 首页所有数量由数据自动生成且一致。
- 首批新增页面全部返回 200，有唯一 title、description、H1、canonical 和 JSON-LD。
- sitemap 只包含 200 页面，不包含 404、重定向或 noindex 页面。
- robots.txt 允许公开内容抓取，不阻止 CSS/JS 关键资源。
- 关键页面移动端无横向溢出，Core Web Vitals 不因广告组件明显恶化。

### 收益

- 至少一种收益路径已上线：AdSense 等待审核中，或直接赞助位已可售。
- 广告配置可一键关闭，且关闭后不影响工具使用。
- 广告和赞助内容均有明确标识，不混淆自然内容。
- 首笔收入以广告后台或赞助付款凭证为准，不以“代码已接入”作为收益。

## 10. 开工默认决定

如无额外修改，实施时采用：

- 单位换算为主主题，Apple Dev 暂不作为首页核心模块。
- AdSense 为主方案，直接赞助/API 合作为月底前收入兜底。
- 默认广告只放在文章页和转换结果下方，不默认开启弹窗、插页和移动端顶部锚定广告。
- 所有广告通过 feature flag 控制，默认关闭。
- 先修 SEO 和内容质量，再申请广告审核；不为赶收入牺牲用户体验或违反广告政策。
