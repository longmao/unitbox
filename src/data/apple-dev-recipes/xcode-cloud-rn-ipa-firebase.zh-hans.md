React Native 项目可以在 Xcode Cloud 里打出签好的 `.ipa`，再发到 Firebase App Distribution，不需要本地 Mac、不需要 Fastlane、不需要手动 `exportArchive`。本文记录一条已验证的端到端链路：push 代码 → Xcode Cloud archive → 自动导出 ad-hoc IPA → Firebase App Distribution → 测试者通知。

真正的大坑只有一个：**不要在 `ci_post_xcodebuild.sh` 里自己调用 `xcodebuild -exportArchive`。** 它一定失败，因为 Xcode Cloud 的内部签名代理对你的脚本是看不见的。正解是直接拿 Cloud 已经帮你导出好的 IPA。下面把整条链路和踩过的所有坑讲清楚。

## Xcode Cloud 只有 3 个脚本钩子

Apple 官方只支持三个（[文档](https://developer.apple.com/documentation/xcode/writing-custom-build-scripts)）：

- `ci_post_clone.sh` — 仓库 clone 完之后
- `ci_pre_xcodebuild.sh` — xcodebuild 之前
- `ci_post_xcodebuild.sh` — xcodebuild 之后

**没有 `ci_post_archive.sh`。** Archive 这个 action 结束后，触发的就是 `ci_post_xcodebuild.sh`。把脚本命名成 `ci_post_archive.sh`，它永远不会执行——这是"我的脚本没跑"最常见的原因。

## ★ 大坑：手动 exportArchive 的签名死结

不要这样做：

```
# ❌ 永远失败，删掉这几行
xcodebuild -exportArchive \
  -archivePath "$CI_ARCHIVE_PATH/YourApp.xcarchive" \
  -exportPath ./out \
  -exportOptionsPlist exportOptions.plist
```

它会报：

```
No signing certificate "iOS Distribution" found
```

**真相**（build log 时序证实）：在 `ci_post_xcodebuild.sh` 执行**之前**，Xcode Cloud 已经用它的**内部签名代理**自动导出三种 IPA（ad-hoc / app-store / development），分别落在：

- `/Volumes/workspace/adhocexport/`
- `/Volumes/workspace/appstoreexport/`
- `/Volumes/workspace/developmentexport/`

那个内部代理长这样，而且**对你的脚本看不见**：

```
-DVTPortalRequest.Endpoint=http://localhost:6667
-DVTProvisioningIsManaged=YES
-DVTSkipCertificateValidityCheck=YES
```

你的手动 `xcodebuild -exportArchive` 拿不到 `localhost:6667`，所以一定报找不到签名证书——不管 exportOptions 写 `ad-hoc` 还是 `development` 都一样。

**正解**：删掉手动导出，直接 `find` 出 Cloud 自动导出的 ad-hoc IPA，上传 Firebase。手动导出不只多余，还会让整个 build 变红。

> 我一度以为"自动汇出发生在 post-xcodebuild 之后，脚本拿不到 IPA"——错了。日志顺序是：自动导出 3 种 → 写 catalog metadata → 才跑 `ci_post_xcodebuild.sh`。脚本执行时 IPA 已经在磁盘上。

## ci_scripts 必须放在 ios/ci_scripts/

RN 项目的 `.xcodeproj` 在 `ios/` 子目录，而 Xcode Cloud 是**相对 `.xcodeproj`** 检测 ci_scripts 的。所以脚本必须放：

```
ios/ci_scripts/ci_post_clone.sh
ios/ci_scripts/ci_post_xcodebuild.sh
```

放在 repo 根目录的 `ci_scripts/` 不会被发现。这是 RN 项目特有的坑（原生 iOS 项目的 `.xcodeproj` 在根目录就没这个问题）。

## ci_post_clone.sh：装依赖

Xcode Cloud 的镜像**只预装了 Homebrew 和 CocoaPods 1.17**，不预装 node / npm / bundler。所以第一件事是装 node：

```bash
#!/bin/sh
set -e

# Image ships no node — must install. CocoaPods is already present (skips).
export HOMEBREW_NO_AUTO_UPDATE=1  # saves 15-30s
brew install node

# JS dependencies
npm ci

# iOS dependencies (use the pre-installed pod, not bundler)
cd ios && pod install
```

`pod install` 偶尔会从 GitHub clone 失败（比如 GTMSessionFetcher reset），加重试就行：

```bash
for i in 1 2 3; do cd ios && pod install && break || sleep 5; done
```

## ci_post_xcodebuild.sh：拿 IPA + 传 Firebase

这个钩子在 build 和 archive 两种 action 后都会触发，所以开头要先判断——不是 archive 就安静退出：

```bash
#!/bin/sh
set -e

# Only Archive produces an IPA. For a plain Build, exit quietly.
[ -z "$CI_ARCHIVE_PATH" ] && exit 0

# Take the ad-hoc IPA Cloud already exported (do NOT manual exportArchive!)
IPA=$(find "${CI_AD_HOC_SIGNED_APP_PATH:-/Volumes/workspace/adhocexport}" -name "*.ipa" | head -1)

if [ -z "$IPA" ]; then
  echo "⚠️ No IPA found, but build is green — download it from Artifacts"
  exit 0
fi

echo "✓ Found IPA: $IPA"

# Upload to Firebase App Distribution
npx firebase-tools@^15 appdistribution:distribute "$IPA" \
  --app "$FIREBASE_APP_ID" \
  --token "$FIREBASE_TOKEN" \
  --groups "testers" \
  --release-notes "Build $CI_BUILD_NUMBER"

# Do NOT fail the build on upload error — the IPA is already in Artifacts
```

关键点：

- `FIREBASE_APP_ID` = `GoogleService-Info.plist` 里的 `GOOGLE_APP_ID`
- `FIREBASE_TOKEN` 走环境变量（本地用 `npx firebase-tools login:ci` 生成 refresh token）
- **firebase-tools 钉 `@^15`**：v15 还支持 `FIREBASE_TOKEN`，v16+ 就移除了，用 `@latest` 哪天升级就挂
- 上传失败要兜底，**不要因为上传失败让 build 变红**——IPA 已经在 Artifacts 里了

## workflow 怎么配

- **Action 选 Archive**（不是 Build；只有 Archive 才会触发自动导出 IPA）
- **Signing → Automatic + 你的 Apple Developer Team**
- **Environment** 加 `FIREBASE_TOKEN`
- 触发条件 `CI_START_CONDITION=push`（push 即触发）；手动触发在 Xcode ⌘9 → Cloud → 右键 workflow → Start a Build

## 调试 checklist

- `ci_post_clone.sh` 没跑 → ci_scripts 没放在 `ios/` 下
- `ci_post_xcodebuild.sh` 没跑 → 文件名取成了 `ci_post_archive`（不存在），或 workflow action 不是 Archive
- `npm: command not found` / `pod: command not found` → 没在 clone 脚本里 `brew install node`
- `No signing certificate "iOS Distribution" found` → 你在手动 exportArchive，删掉它
- Firebase 上传失败但 build 是绿的 → 正常，上传单独兜底，IPA 在 Artifacts
- 想拿 IPA 文件 → Xcode Cloud Organizer → 该 build → Artifacts → "YourApp 1.0 ad-hoc"
