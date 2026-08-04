一人公司或小团队给 React Native 出 iOS 包，常卡的点：本地 Mac 绑死、苹果签名死结、TestFlight 审核慢、CI 按分钟烧钱。这里讲一套实战跑通的架构：**Xcode Cloud + GitLab CI 双 CI 线路 + Firebase App Distribution 分发 + Lark 通知闭环**，云端出包、零本地 Mac、签名全自动、测试者一个链接装机。

## 架构一图

```
                 ┌── push master ──→ Xcode Cloud (archive) ──┐
                 │                                              ├──→ Firebase App Distribution ──→ 测试者装机
git push ────────┤                                              │
                 └── push beta  ──→ GitLab CI (match + gym) ───┘
                                        │
                                        └──→ Lark webhook（build 成败通知）
```

两条 CI 线路按分支分流，都把 IPA 发到同一个 Firebase 项目，测试者无感。

## 优势 1 · 双 CI 冗余互补，一条挂了另一条顶

Xcode Cloud 和 GitLab CI 是两套完全独立的 CI：

- **Xcode Cloud**：苹果原生，云托管签名（内部签名代理，免配置证书），和 App Store Connect 深度集成，但灵活性低、配额按分钟。
- **GitLab CI**：灵活（stage 自由编排、自托管或 SaaS、缓存可控），和代码库同源，但签名要自己搞（fastlane match）。

按分支分流：master 走 Xcode Cloud（出正式包 / 归档），beta 走 GitLab CI（出测试包）。一套挂了（苹果服务波动、runner 排队），另一套还能出包。这种冗余对一个人或小团队是保险——你不会因为单一 CI 故障卡住发版。

## 优势 2 · 零本地 Mac 依赖

两套 CI 都是云端 build（Xcode Cloud 苹托管、GitLab SaaS macOS runner）。开发者的机器只跑日常迭代（本地 Xcode 模拟器约 3 分钟装上 iPhone），出包全在云上。换电脑、出差、Mac 故障，都不影响发版。

## 优势 3 · 两种签名范式都覆盖

签名是 iOS 出包最大的坑。这套架构同时覆盖两种解法：

- **Xcode Cloud 的内部签名代理**：苹果托管，脚本完全不用管证书——CI 里拿到的 IPA 已经签好。代价是你看不到证书细节（对一个 app 通常无所谓）。
- **GitLab CI 的 fastlane match**：证书加密存私有 git 仓，CI readonly 拉取。透明、可迁移、支持多 app，但要自己运维证书仓。

两种范式都跑通后，你对 iOS 签名的理解是完整的——以后换任何 CI 都不怵。

## 优势 4 · Firebase 统一分发，绕开 TestFlight 审核

两套 CI 产出的 IPA 都发到**同一个 Firebase App Distribution 项目**。测试者（或你自己）装一次 Firebase 的 web clip，之后每个新 build 推一个装机链接，点一下就装——**没有 TestFlight 的审核等待**。

这一个人公司特别重要：你想给一个早期用户看个 demo，TestFlight 要加测试者、等审核；Firebase 是即时装机链接。两套 CI 都用 firebase-tools CLI 分发，链路统一。

## 优势 5 · Lark / webhook 闭环，不在 CI 面板等

GitLab CI 的 notify stage 在 Linux runner 上跑（省 macOS 分钟），build 成败 + 分支 + 版本 + 提交实时推 Lark 群。你 push 完去干别的，结果来了再看——不用盯着 CI 面板轮询。Xcode Cloud 这边配邮件 / ASC 通知，两端都闭环。

## 优势 6 · 成本按需，分支触发避免浪费

- **Xcode Cloud**：按月分钟计费（有免费额度），只在 master push 触发 archive。
- **GitLab CI**：SaaS macOS runner 按需，只在 beta push 触发全量；validate stage 在 master push 跑 dry-run（`allow_failure`，是信号不是门）。

按分支触发 + cache（key: Podfile.lock + Gemfile.lock）+ gym 增量，日常每次出包成本可控。配合 cache，GitLab CI 二次构建从全量约 14 分钟降到增量约 4 分钟。

## 取舍

这套架构不是没成本：

- **两套 CI 都要维护**：双 CI 是冗余也是双份配置。都模板化后维护量低，但确实两份。
- **GitLab SaaS macOS runner 要付费**（Premium 档）。省不掉的话，Xcode Cloud 单线 + 本地 fastlane 也能跑，只是没冗余。
- **签名两套范式要都学会**（match + Xcode Cloud 代理）。有学习曲线，但是一次性的。

## 这套架构已经开源

这套双 CI + Firebase + Lark 的完整配置（ci_scripts / .gitlab-ci.yml / fastlane / UITest target 脚本 / smoke 测试）抽成了一个开源模板，fork 即用：

[github.com/longmao/rn-ios-cicd-template](https://github.com/longmao/rn-ios-cicd-template)

配套的踩坑细节见本系列另两篇——Xcode Cloud + React Native 把 IPA 发到 Firebase（绕开签名死结），以及 GitLab CI 给 React Native 出 iOS 包（5 个连环坑）。
