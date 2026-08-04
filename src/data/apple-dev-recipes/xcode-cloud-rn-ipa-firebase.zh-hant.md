React Native 專案可以在 Xcode Cloud 裡打出簽好的 `.ipa`，再發到 Firebase App Distribution，不需要本地 Mac、不需要 Fastlane、不需要手動 `exportArchive`。本文記錄一條已驗證的端到端鏈路：push 程式碼 → Xcode Cloud archive → 自動匯出 ad-hoc IPA → Firebase App Distribution → 測試者通知。

真正的大坑只有一個：**不要在 `ci_post_xcodebuild.sh` 裡自己呼叫 `xcodebuild -exportArchive`。** 它一定失敗，因為 Xcode Cloud 的內部簽章代理對你的腳本是看不見的。正解是直接拿 Cloud 已經幫你匯出好的 IPA。下面把整條鏈路和踩過的所有坑講清楚。

## Xcode Cloud 只有 3 個腳本鉤子

Apple 官方只支援三個（[文件](https://developer.apple.com/documentation/xcode/writing-custom-build-scripts)）：

- `ci_post_clone.sh` — 倉庫 clone 完之後
- `ci_pre_xcodebuild.sh` — xcodebuild 之前
- `ci_post_xcodebuild.sh` — xcodebuild 之後

**沒有 `ci_post_archive.sh`。** Archive 這個 action 結束後，觸發的就是 `ci_post_xcodebuild.sh`。把腳本命名成 `ci_post_archive.sh`，它永遠不會執行——這是「我的腳本沒跑」最常見的原因。

## ★ 大坑：手動 exportArchive 的簽章死結

不要這樣做：

```
# ❌ 永遠失敗，刪掉這幾行
xcodebuild -exportArchive \
  -archivePath "$CI_ARCHIVE_PATH/YourApp.xcarchive" \
  -exportPath ./out \
  -exportOptionsPlist exportOptions.plist
```

它會報：

```
No signing certificate "iOS Distribution" found
```

**真相**（build log 時序證實）：在 `ci_post_xcodebuild.sh` 執行**之前**，Xcode Cloud 已經用它的**內部簽章代理**自動匯出三種 IPA（ad-hoc / app-store / development），分別落在：

- `/Volumes/workspace/adhocexport/`
- `/Volumes/workspace/appstoreexport/`
- `/Volumes/workspace/developmentexport/`

那個內部代理長這樣，而且**對你的腳本看不見**：

```
-DVTPortalRequest.Endpoint=http://localhost:6667
-DVTProvisioningIsManaged=YES
-DVTSkipCertificateValidityCheck=YES
```

你的手動 `xcodebuild -exportArchive` 拿不到 `localhost:6667`，所以一定報找不到簽章憑證——不管 exportOptions 寫 `ad-hoc` 還是 `development` 都一樣。

**正解**：刪掉手動匯出，直接 `find` 出 Cloud 自動匯出的 ad-hoc IPA，上傳 Firebase。手動匯出不只多餘，還會讓整個 build 變紅。

> 我一度以為「自動匯出發生在 post-xcodebuild *之後*，腳本拿不到 IPA」——錯了。log 順序是：自動匯出 3 種 → 寫 catalog metadata → *才* 跑 `ci_post_xcodebuild.sh`。腳本執行時 IPA 已經在磁碟上。

## ci_scripts 必須放在 ios/ci_scripts/

RN 專案的 `.xcodeproj` 在 `ios/` 子目錄，而 Xcode Cloud 是**相對 `.xcodeproj`** 偵測 ci_scripts 的。所以腳本必須放：

```
ios/ci_scripts/ci_post_clone.sh
ios/ci_scripts/ci_post_xcodebuild.sh
```

放在 repo 根目錄的 `ci_scripts/` 不會被發現。這是 RN 專案特有的坑（原生 iOS 專案的 `.xcodeproj` 在根目錄就沒這問題）。

## ci_post_clone.sh：安裝依賴

Xcode Cloud 的映像**只預裝了 Homebrew 和 CocoaPods 1.17**，不預裝 node / npm / bundler。所以第一件事是裝 node：

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

`pod install` 偶爾會從 GitHub clone 失敗（例如 GTMSessionFetcher reset），加重試就行：

```bash
for i in 1 2 3; do cd ios && pod install && break || sleep 5; done
```

## ci_post_xcodebuild.sh：拿 IPA + 傳 Firebase

這個鉤子在 build 和 archive 兩種 action 後都會觸發，所以開頭要先判斷——不是 archive 就安靜退出：

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

關鍵點：

- `FIREBASE_APP_ID` = `GoogleService-Info.plist` 裡的 `GOOGLE_APP_ID`
- `FIREBASE_TOKEN` 走環境變數（本地用 `npx firebase-tools login:ci` 產生 refresh token）
- **firebase-tools 錨定 `@^15`**：v15 還支援 `FIREBASE_TOKEN`，v16+ 就移除了，用 `@latest` 哪天升級就掛
- 上傳失敗要兜底，**不要因為上傳失敗讓 build 變紅**——IPA 已經在 Artifacts 裡了

## workflow 怎麼配

- **Action 選 Archive**（不是 Build；只有 Archive 才會觸發自動匯出 IPA）
- **Signing → Automatic + 你的 Apple Developer Team**
- **Environment** 加 `FIREBASE_TOKEN`
- 觸發條件 `CI_START_CONDITION=push`（push 即觸發）；手動觸發在 Xcode ⌘9 → Cloud → 右鍵 workflow → Start a Build

## 除錯 checklist

- `ci_post_clone.sh` 沒跑 → ci_scripts 沒放在 `ios/` 下
- `ci_post_xcodebuild.sh` 沒跑 → 檔名取成了 `ci_post_archive`（不存在），或 workflow action 不是 Archive
- `npm: command not found` / `pod: command not found` → 沒在 clone 腳本裡 `brew install node`
- `No signing certificate "iOS Distribution" found` → 你在手動 exportArchive，刪掉它
- Firebase 上傳失敗但 build 是綠的 → 正常，上傳單獨兜底，IPA 在 Artifacts
- 想拿 IPA 檔 → Xcode Cloud Organizer → 該 build → Artifacts → "YourApp 1.0 ad-hoc"
