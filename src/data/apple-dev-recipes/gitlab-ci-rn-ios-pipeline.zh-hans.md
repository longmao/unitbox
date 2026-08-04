React Native 项目可以用 GitLab CI 在云端出签好的 IPA 并发到 Firebase，不必本地 Mac、不必手动签名。和 Xcode Cloud 比，GitLab CI 的优势是：和代码库同源、stage 能自由编排、可按分支分流（比如 master 走 Xcode Cloud、beta 走 GitLab CI）、自托管或 SaaS macOS runner 都行。

本文记录一条已验证的链路：push 到 beta 分支 → GitLab CI（validate → prepare → build → notify）→ IPA → Firebase App Distribution。以及真实跑通时撞的 5 个连环坑。

## pipeline 结构：四个 stage

```
validate → prepare → build → notify
```

- **validate**：dry-run（master push 也跑），验证证书仓 SSH 能通 + `fastlane match --readonly` 能解密证书。`allow_failure: true`——它是快速信号，不是门，挂了不阻断 master push。
- **prepare**：`npm ci` + `bundle install` + `pod install`，产出 `node_modules` / `Pods` / `vendor/bundle`，作为 artifacts 传给 build。
- **build**：`fastlane gym` 出 IPA，artifacts 保留 IPA + dSYM。
- **notify**：放在 **Linux runner** 上发 webhook（别为一个 HTTP POST 烧 macOS 分钟）。

## .gitlab-ci.yml 骨架

```yaml
workflow:
  rules:
    - if: $CI_COMMIT_BRANCH == "master"   # validate only
    - if: $CI_COMMIT_BRANCH == "beta"     # full pipeline
    - if: $CI_PIPELINE_SOURCE == "web"    # manual

stages: [validate, prepare, build, notify]

variables:
  APP_SCHEME: "YourApp"
  BUNDLE_ID: "app.example.client"
  WORKSPACE: "YourApp.xcworkspace"

# GitLab 限制：cache.key.files 最多 2 个。挑变化最慢的两个。
.ios_cache: &ios_cache
  key:
    files: [ios/Podfile.lock, Gemfile.lock]
  paths: [node_modules/, ios/Pods/, vendor/bundle/, .bundle/, fastlane/build/]
```

build job 的关键是 `needs: [prepare_ios]`（直接消费 prepare artifacts，不等整个 stage 完成）+ macOS runner tag：

```yaml
build_ios:
  stage: build
  image: macos-15-xcode-16
  tags: [saas-macos-medium-m1]
  needs: [prepare_ios]
  before_script:
    # match 要 git clone 证书仓（SSH），加载 deploy key
    - eval $(ssh-agent -s)
    - chmod 600 "$SSH_PRIVATE_KEY" && ssh-add "$SSH_PRIVATE_KEY"
  script:
    - bundle exec fastlane ios build_and_distribute
  artifacts:
    paths: [fastlane/build/*.ipa, fastlane/build/*.dSYM.zip]
    when: always
```

## 签名：fastlane match（核心）

match 把签名证书 + provisioning profile 加密存到一个私有 git 仓，CI 用 `readonly: true` 只读拉取——ephemeral runner 每次重新解密，不在 CI 落明文。

CI 是非交互 shell，没有 Apple ID 登录，所以用 **App Store Connect API key** 认证（绕开 2FA）：

```ruby
def asc_api_key
  app_store_connect_api_key(
    key_id: ENV["ASC_KEY_ID"],
    issuer_id: ENV["ASC_ISSUER_ID"],
    key_filepath: ENV["ASC_KEY_FILEPATH"],
    in_house: false, duration: 1_200
  )
end

match(
  type: "development",       # 或 "adhoc" / "appstore"
  readonly: true,            # CI 只读，不回写证书仓
  api_key: asc_api_key,
  keychain_name: ENV["MATCH_KEYCHAIN_NAME"],
  keychain_password: ENV["MATCH_KEYCHAIN_PASSWORD"]
)
```

## ★ 5 个连环坑

整条链路撞了 5 个坑，每个都卡过一两个小时。

### 坑 1 · match 的 commit message 被 group hook 拒 → cert 撑爆 Apple 名额

如果证书仓和代码仓在同一个 GitLab group，且 group 设了 commit-message 正则钩子（比如强制 `type:` 前缀），match 默认 commit 的 `[fastlane] ...` 不合规 → push 被拒 → 证书私钥无法持久化 → ephemeral runner 下次又从头建证书 → **死循环建 cert，撑爆 Apple Developer 账号的证书名额**（个人账号上限很低）。GitLab 免费版的 push rules API 不开放（404），match 也没有 commit_message 选项。

**解法**：本地用一个 bare 仓（`file:///tmp/certs-seed.git`，无 hook）先 seed 证书，手动 amend 成合规 commit 再 push 到 GitLab；CI 里 `match(readonly: true)` 永远只读，彻底绕开 match 的 push。

### 坑 2 · gym archive 报 "Automatic signing is disabled"

RN 旧模板的 target 常带 `CODE_SIGN_IDENTITY="iPhone Developer"` 占位 + 没设 `CODE_SIGN_STYLE`，gym archive 时报 "No profiles / Automatic signing is disabled"。加 `-allowProvisioningUpdates` 又报 "No Accounts"（CI 没登录 Apple ID）。

**解法**：gym 的 xcargs 带上 ASC API key 三元组（和 match 用同一把 .p8），让 xcodebuild 靠 API key 做 automatic signing，绕开 Apple ID：

```ruby
gym(
  workspace: ENV["WORKSPACE"],
  export_method: "development",
  xcargs: "-authenticationKeyPath #{ENV['ASC_KEY_FILEPATH']} " \
          "-authenticationKeyID #{ENV['ASC_KEY_ID']} " \
          "-authenticationKeyIssuerID #{ENV['ASC_ISSUER_ID']}"
)
```

### 坑 3 · RN codegen 产物漏传 → "rnscreens-generated.mm cannot be found"

prepare 的 `pod install` 会在 `ios/build/generated/` 生成 RN codegen 产物（ReactCodegen target 的编译依赖）。artifacts 没传这个目录，build job 报 "Build input file cannot be found: ...rnscreens-generated.mm"。

**解法**：prepare 的 artifacts 加上 `ios/build/generated/`。

### 坑 4 · Pods cache 和 artifacts 不同步 → "sandbox is not in sync with Podfile.lock"

如果 build job 自己 cache 了 `ios/Pods/`（旧 Manifest.lock），而 prepare artifacts 带的是新 Pods，两者不同步 → "sandbox is not in sync with Podfile.lock"。

**解法**：build job **不要**自己 cache Pods/node_modules（全由 prepare artifacts 提供）；prepare artifacts 同时带上 `ios/Podfile.lock`。

### 坑 5 · 去 cache 连带丢 .bundle/config → Bundler::GemNotFound

坑 4 去掉 build job 的 cache 后，连带把 `.bundle/config` 也丢了（它原本在 cache 里），`bundle exec fastlane` 报 `Bundler::GemNotFound`。

**解法**：build job script 里显式 `bundle config set path vendor/bundle`，指向 prepare artifacts 里的 gems。

## 分发：Firebase App Distribution

gym 出 IPA 后，最稳的分发是 **firebase-tools CLI**，不是 fastlane 的 `firebase_app_distribution` 插件——插件走 staged rollout 路径时会报 "HALTED release must have fraction"（plugin 调的 API 没有 fraction 字段，升版本也没用）。

```bash
npx firebase-tools appdistribution:distribute fastlane/build/YourApp.ipa \
  --app "$FIREBASE_APP_ID" \
  --token "$FIREBASE_TOKEN" \
  --groups "qa-team"
```

CLI 走 batchAddRelease 直接把 build 加进测试组，绕开 staged rollout。注意 `--token` 在新版 deprecated，长期换 service account + `GOOGLE_APPLICATION_CREDENTIALS`。

## 两个 fastlane 小坑

- 改 displayName 别用 `sh "plutil -string ..."`——引号会被 CI 的 sh 包装层吞。用 fastlane 的 `update_info_plist` action（底层 Xcodeproj gem）。
- `update_info_plist` 的 `plist_path` 是**相对 .xcodeproj 父目录**（即 `ios/`）。传 `ios/YourApp/Info.plist` 会被拼成 `ios/YourApp.xcodeproj/../ios/YourApp/Info.plist`（双层 ios）。正确写法是 `YourApp/Info.plist`。

## cache 策略

GitLab 的 `cache.key.files` 最多 2 个文件，挑**变化最慢**的两个当 key：`ios/Podfile.lock` + `Gemfile.lock`。这两个不变就命中 cache（Pods / node_modules / vendor 全复用），变了才重建。配合 gym 的 `derived_data_path: ios/build/DerivedData` 缓存衍生数据，二次构建从全量 ~14 分钟降到增量 ~4 分钟。

## 分支分流纪律

同时用 Xcode Cloud 和 GitLab CI 时，按分支分流、互不干扰：master 触发 Xcode Cloud，beta 触发 GitLab CI。**CI 改动只 push beta，绝不 push master**——否则会触发另一套 CI 白跑。

## 调试 checklist

- match push 被拒 → group commit-message hook（坑 1），改本地 seed + CI readonly
- archive 报 Automatic signing disabled → CODE_SIGN_IDENTITY 占位 + 无 STYLE（坑 2），gym xcargs 带 API key
- rnscreens-generated.mm 找不到 → prepare artifacts 漏 ios/build/generated/（坑 3）
- sandbox not in sync with Podfile.lock → build job 自己 cache 了旧 Pods（坑 4），去掉 + 加 Podfile.lock
- Bundler::GemNotFound → 去 cache 丢 .bundle/config（坑 5），显式 bundle config set path
- firebase 分发报 HALTED release fraction → 插件坑，换 firebase-tools CLI
- CI 偶发 Apple cert 名额满 → 坑 1 的死循环建 cert，检查 match 是否 readonly
- macOS runner 分钟烧太快 → notify 放 Linux runner；gym clean 默认 false 走增量
