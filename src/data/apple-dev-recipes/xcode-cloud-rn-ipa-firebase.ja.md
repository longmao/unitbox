React Native プロジェクトは、Xcode Cloud 上で署名済みの `.ipa` をビルドし、Firebase App Distribution に届けられる。ローカルの Mac も、Fastlane も、手動の `exportArchive` もいらない。本記事は、検証済みのエンドツーエンドのループを記録したものだ：コードを push → Xcode Cloud で archive → 自動エクスポートされた ad-hoc IPA → Firebase App Distribution → テスターへの通知。

本当に罠は 1 つだけ：**`ci_post_xcodebuild.sh` の中で自分で `xcodebuild -exportArchive` を呼ばないこと。** これは必ず失敗する。Xcode Cloud の内部署名プロキシはあなたのスクリプトからは見えないからだ。正解は、Cloud が既にあなたのためにエクスポートしてくれた IPA を拾うこと。以下では、チェーン全体と私たちが踏んだ落とし穴をすべて書き出す。

## Xcode Cloud のスクリプトフックは 3 つだけ

Apple が公式にサポートしているのは次の 3 つのみ（[ドキュメント](https://developer.apple.com/documentation/xcode/writing-custom-build-scripts)）：

- `ci_post_clone.sh` — リポジトリの clone 後
- `ci_pre_xcodebuild.sh` — xcodebuild の前
- `ci_post_xcodebuild.sh` — xcodebuild の後

**`ci_post_archive.sh` は存在しない。** Archive アクションが終わった後に発火するのは `ci_post_xcodebuild.sh` だ。スクリプト名を `ci_post_archive.sh` にすると、永遠に実行されない——これが「スクリプトが動かない」系のトラブルで最も多い原因。

## ★ 大きな罠：手動 exportArchive の署名の失敗

こうしてはいけない：

```
# ❌ 必ず失敗する——この行は削除
xcodebuild -exportArchive \
  -archivePath "$CI_ARCHIVE_PATH/YourApp.xcarchive" \
  -exportPath ./out \
  -exportOptionsPlist exportOptions.plist
```

次のようなエラーが出る：

```
No signing certificate "iOS Distribution" found
```

**実際に起きていること**（build log の時系列で裏取り済み）：`ci_post_xcodebuild.sh` が走る**前**に、Xcode Cloud は**既に**内部の署名プロキシを使って 3 種類の IPA（ad-hoc / app-store / development）を自動エクスポートし、次の場所に置いている：

- `/Volumes/workspace/adhocexport/`
- `/Volumes/workspace/appstoreexport/`
- `/Volumes/workspace/developmentexport/`

その内部プロキシは次のようなもので、**あなたのスクリプトからは見えない**：

```
-DVTPortalRequest.Endpoint=http://localhost:6667
-DVTProvisioningIsManaged=YES
-DVTSkipCertificateValidityCheck=YES
```

あなたの手動 `xcodebuild -exportArchive` は `localhost:6667` に届かない。だから exportOptions に `ad-hoc` と書いても `development` と書いても、必ず「署名証明書が見つからない」と報告される。

**正解**：手動エクスポートは完全に削除し、Cloud が既に生成した ad-hoc IPA を `find` で拾って、それを Firebase にアップロードする。手動エクスポートは単なる余計な作業ではなく、build を赤くする元凶だ。

> 私は当初「自動エクスポートは post-xcodebuild の *後* に走るから、スクリプトは IPA を見られない」と思い込んでいた。違う。log の順序は：3 バリアントを自動エクスポート → catalog metadata を書き出し → *そのあと* `ci_post_xcodebuild.sh` が実行される。スクリプトが走る時点で、IPA は既にディスク上にある。

## ci_scripts は ios/ci_scripts/ に置く必須

React Native プロジェクトでは `.xcodeproj` が `ios/` サブディレクトリの中にあり、Xcode Cloud は `.xcodeproj` を**基準に** `ci_scripts` を探す。だからスクリプトは次の場所に置く：

```
ios/ci_scripts/ci_post_clone.sh
ios/ci_scripts/ci_post_xcodebuild.sh
```

repo のルートに置いた `ci_scripts/` は見つからない。これは RN プロジェクト特有の罠（ネイティブ iOS プロジェクトは `.xcodeproj` がルートにあるので、この問題は起きない）。

## ci_post_clone.sh：依存関係をインストール

Xcode Cloud のイメージは **Homebrew と CocoaPods 1.17 しかプリインストールしていない**——node も npm も bundler もない。なので最初のステップは node のインストールだ：

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

`pod install` は時折 GitHub からの clone に失敗する（GTMSessionFetcher の reset など）。リトライを入れておけば直る：

```bash
for i in 1 2 3; do cd ios && pod install && break || sleep 5; done
```

## ci_post_xcodebuild.sh：IPA を拾って Firebase にアップロード

このフックは Build と Archive 両方のアクションの後に発火する。なので先頭でガードする——Archive でなければ静かに抜ける：

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

ポイント：

- `FIREBASE_APP_ID` = `GoogleService-Info.plist` の中の `GOOGLE_APP_ID`
- `FIREBASE_TOKEN` は環境変数（ローカルで `npx firebase-tools login:ci` で生成）
- **`firebase-tools` を `@^15` で固定**：v15 はまだ `FIREBASE_TOKEN` を受け付けるが、v16+ では削除される。`@latest` を使っていると、バージョンが上がった日に壊れる。
- アップロードの失敗で build が赤くならないようラップすること——IPA は既に Artifacts に安全にある。

## workflow の設定

- **Action = Archive**（Build ではない——Archive のみが IPA の自動エクスポートをトリガーする）
- **Signing → Automatic + 自分の Apple Developer Team**
- **Environment** に `FIREBASE_TOKEN` を追加
- トリガーは `CI_START_CONDITION=push`（push でビルドが発火）。手動で回すなら：Xcode ⌘9 → Cloud → workflow を右クリック → Start a Build

## デバッグ checklist

- `ci_post_clone.sh` が動かない → ci_scripts が `ios/` の下にない
- `ci_post_xcodebuild.sh` が動かない → ファイル名が `ci_post_archive`（存在しない）になっているか、workflow のアクションが Archive ではない
- `npm: command not found` / `pod: command not found` → clone スクリプトで `brew install node` していない
- `No signing certificate "iOS Distribution" found` → 手動で exportArchive している。削除すること
- Firebase へのアップロードが失敗したが build は緑 → 想定通り。アップロードはベストエフォートで、IPA は Artifacts にある
- IPA ファイルを手に入れたい → Xcode Cloud Organizer → 該当 build → Artifacts → "YourApp 1.0 ad-hoc"
