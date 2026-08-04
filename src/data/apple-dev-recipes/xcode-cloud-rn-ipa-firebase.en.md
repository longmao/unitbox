A React Native project can build a signed `.ipa` in Xcode Cloud and ship it to Firebase App Distribution with no local Mac, no Fastlane, and no manual `exportArchive`. This article documents a verified, end-to-end loop: push code → Xcode Cloud archive → auto-exported ad-hoc IPA → Firebase App Distribution → tester notification.

There is really only one trap: **do not call `xcodebuild -exportArchive` yourself inside `ci_post_xcodebuild.sh`.** It always fails, because Xcode Cloud's internal signing proxy is invisible to your script. The fix is to grab the IPA that Cloud already exported for you. Everything else below is the full chain and every pitfall we hit.

## Xcode Cloud has only 3 script hooks

Apple officially supports only three ([docs](https://developer.apple.com/documentation/xcode/writing-custom-build-scripts)):

- `ci_post_clone.sh` — after the repository is cloned
- `ci_pre_xcodebuild.sh` — before xcodebuild
- `ci_post_xcodebuild.sh` — after xcodebuild

**There is no `ci_post_archive.sh`.** When the Archive action finishes, the hook that fires is `ci_post_xcodebuild.sh`. Name your script `ci_post_archive.sh` and it will simply never run — this is the most common "my script didn't execute" cause.

## ★ The big trap: manual exportArchive signing failure

Do not do this:

```
# ❌ Always fails — delete these lines
xcodebuild -exportArchive \
  -archivePath "$CI_ARCHIVE_PATH/YourApp.xcarchive" \
  -exportPath ./out \
  -exportOptionsPlist exportOptions.plist
```

It fails with:

```
No signing certificate "iOS Distribution" found
```

**What's actually happening** (confirmed by build-log timing): before `ci_post_xcodebuild.sh` runs, Xcode Cloud has **already** auto-exported three IPAs (ad-hoc / app-store / development) using its internal signing proxy, dropped at:

- `/Volumes/workspace/adhocexport/`
- `/Volumes/workspace/appstoreexport/`
- `/Volumes/workspace/developmentexport/`

That internal proxy looks like this, and it is **invisible to your script**:

```
-DVTPortalRequest.Endpoint=http://localhost:6667
-DVTProvisioningIsManaged=YES
-DVTSkipCertificateValidityCheck=YES
```

Your manual `xcodebuild -exportArchive` cannot reach `localhost:6667`, so it always reports "no signing certificate" — regardless of whether exportOptions says `ad-hoc` or `development`.

**The fix**: delete the manual export entirely, `find` the ad-hoc IPA Cloud already produced, and upload that to Firebase. Manual export is not just redundant, it turns the build red.

> I initially assumed "auto-export happens *after* post-xcodebuild, so the script can't see the IPA." Wrong. Log order is: auto-export 3 variants → write catalog metadata → *then* run `ci_post_xcodebuild.sh`. By the time your script runs, the IPA is already on disk.

## ci_scripts must live in ios/ci_scripts/

In a React Native project the `.xcodeproj` sits inside the `ios/` subdirectory, and Xcode Cloud resolves `ci_scripts` **relative to the `.xcodeproj`**. So the scripts must go to:

```
ios/ci_scripts/ci_post_clone.sh
ios/ci_scripts/ci_post_xcodebuild.sh
```

A `ci_scripts/` at the repo root will not be found. This is a React-Native-specific gotcha (a native iOS project has its `.xcodeproj` at the root, so it doesn't hit this).

## ci_post_clone.sh: install dependencies

The Xcode Cloud image **only pre-installs Homebrew and CocoaPods 1.17** — no node, no npm, no bundler. So step one is installing node:

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

`pod install` occasionally fails to clone from GitHub (e.g. GTMSessionFetcher reset) — add a retry:

```bash
for i in 1 2 3; do cd ios && pod install && break || sleep 5; done
```

## ci_post_xcodebuild.sh: grab the IPA, upload to Firebase

This hook fires after both Build and Archive actions, so guard at the top — if it's not an Archive, exit quietly:

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

Key points:

- `FIREBASE_APP_ID` = the `GOOGLE_APP_ID` inside `GoogleService-Info.plist`
- `FIREBASE_TOKEN` is an env var (generate locally with `npx firebase-tools login:ci`)
- **Pin `firebase-tools@^15`**: v15 still accepts `FIREBASE_TOKEN`; v16+ removes it. Using `@latest` will break the day it bumps.
- Wrap the upload so a failure does **not** turn the build red — the IPA is already safe in Artifacts.

## How to configure the workflow

- **Action = Archive** (not Build — only Archive triggers the auto-export of IPA)
- **Signing → Automatic + your Apple Developer Team**
- **Environment**: add `FIREBASE_TOKEN`
- Trigger with `CI_START_CONDITION=push` (push triggers a build); to run manually: Xcode ⌘9 → Cloud → right-click the workflow → Start a Build

## Debug checklist

- `ci_post_clone.sh` didn't run → ci_scripts is not under `ios/`
- `ci_post_xcodebuild.sh` didn't run → file named `ci_post_archive` (doesn't exist), or workflow action isn't Archive
- `npm: command not found` / `pod: command not found` → didn't `brew install node` in the clone script
- `No signing certificate "iOS Distribution" found` → you're manual-exportArchiving; delete it
- Firebase upload failed but build is green → expected; the upload is best-effort, IPA is in Artifacts
- To grab the IPA file → Xcode Cloud Organizer → the build → Artifacts → "YourApp 1.0 ad-hoc"
