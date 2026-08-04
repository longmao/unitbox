React Native 프로젝트는 Xcode Cloud에서 서명된 `.ipa`를 빌드해서 Firebase App Distribution으로 보낼 수 있다. 로컬 Mac도, Fastlane도, 수동 `exportArchive`도 필요 없다. 이 글은 검증된 엔드투엔드 루프를 기록한 것이다: 코드를 push → Xcode Cloud에서 archive → 자동 내보내기된 ad-hoc IPA → Firebase App Distribution → 테스터 알림.

정말로 함정은 하나뿐이다: **`ci_post_xcodebuild.sh` 안에서 직접 `xcodebuild -exportArchive`를 호출하지 마라.** 이건 항상 실패한다. Xcode Cloud의 내부 서명 프록시가 네 스크립트에서는 보이지 않기 때문이다. 정답은 Cloud가 널 위해 이미 내보낸 IPA를 가져오는 것이다. 아래는 전체 체인과 우리가 밟은 모든 함정이다.

## Xcode Cloud의 스크립트 훅은 3개뿐

Apple이 공식으로 지원하는 건 다음 세 가지뿐이다([문서](https://developer.apple.com/documentation/xcode/writing-custom-build-scripts)):

- `ci_post_clone.sh` — 리포지토리 clone 이후
- `ci_pre_xcodebuild.sh` — xcodebuild 이전
- `ci_post_xcodebuild.sh` — xcodebuild 이후

**`ci_post_archive.sh`는 존재하지 않는다.** Archive 액션이 끝난 뒤 발화하는 훅은 `ci_post_xcodebuild.sh`다. 스크립트 이름을 `ci_post_archive.sh`로 짓으면 영영 실행되지 않는다——이게 "스크립트가 안 돌아요"류 트러블에서 가장 흔한 원인이다.

## ★ 큰 함정: 수동 exportArchive 서명 실패

이렇게 하면 안 된다:

```
# ❌ 반드시 실패한다——이 줄은 삭제
xcodebuild -exportArchive \
  -archivePath "$CI_ARCHIVE_PATH/YourApp.xcarchive" \
  -exportPath ./out \
  -exportOptionsPlist exportOptions.plist
```

이런 에러가 난다:

```
No signing certificate "iOS Distribution" found
```

**실제로 일어나는 일**(build log 시간순으로 확인 완료): `ci_post_xcodebuild.sh`가 돌기 **전에**, Xcode Cloud는 **이미** 내부 서명 프록시를 써서 3종 IPA(ad-hoc / app-store / development)를 자동 내보내기해서 다음 위치에 뒀다:

- `/Volumes/workspace/adhocexport/`
- `/Volumes/workspace/appstoreexport/`
- `/Volumes/workspace/developmentexport/`

그 내부 프록시는 이런 식이고, **네 스크립트에서는 보이지 않는다**:

```
-DVTPortalRequest.Endpoint=http://localhost:6667
-DVTProvisioningIsManaged=YES
-DVTSkipCertificateValidityCheck=YES
```

네 수동 `xcodebuild -exportArchive`는 `localhost:6667`에 닿지 못한다. 그래서 exportOptions에 `ad-hoc`이라 쓰든 `development`라 쓰든, 무조건 "서명 인증서를 찾을 수 없다"고 보고한다.

**정답**: 수동 내보내기를 완전히 삭제하고, Cloud가 이미 만든 ad-hoc IPA를 `find`로 찾아, 그걸 Firebase에 업로드한다. 수동 내보내기는 단순한 중복이 아니라 build를 빨갛게 만드는 주범이다.

> 나는 처음에 "자동 내보내기는 post-xcodebuild의 *뒤에* 돌으니까, 스크립트는 IPA를 못 본다"고 짐작했다. 틀렸다. log 순서는: 3개 변형 자동 내보내기 → catalog metadata 작성 → *그 다음* `ci_post_xcodebuild.sh` 실행. 스크립트가 돌 시점엔 IPA가 이미 디스크에 있다.

## ci_scripts는 반드시 ios/ci_scripts/에

React Native 프로젝트에서 `.xcodeproj`는 `ios/` 서브디렉토리 안에 있고, Xcode Cloud는 `.xcodeproj`를 **기준으로** `ci_scripts`를 찾는다. 그러므로 스크립트는 다음 위치에 둬야 한다:

```
ios/ci_scripts/ci_post_clone.sh
ios/ci_scripts/ci_post_xcodebuild.sh
```

repo 루트에 둔 `ci_scripts/`는 찾아지지 않는다. 이건 RN 프로젝트 특유의 함정이다(네이티브 iOS 프로젝트는 `.xcodeproj`가 루트에 있어서 이 문제가 안 생긴다).

## ci_post_clone.sh: 의존성 설치

Xcode Cloud 이미지는 **Homebrew와 CocoaPods 1.17만 미리 깔아둔다**——node도 npm도 bundler도 없다. 그래서 첫 단계는 node 설치다:

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

`pod install`은 가끔 GitHub에서 clone하다 실패한다(GTMSessionFetcher reset 등). 재시도를 넣으면 고쳐진다:

```bash
for i in 1 2 3; do cd ios && pod install && break || sleep 5; done
```

## ci_post_xcodebuild.sh: IPA를 가져와 Firebase에 업로드

이 훅은 Build와 Archive 양쪽 액션 이후에 모두 발화한다. 그러니 맨 위에서 가드한다——Archive가 아니면 조용히 빠져나간다:

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

핵심 포인트:

- `FIREBASE_APP_ID` = `GoogleService-Info.plist` 안의 `GOOGLE_APP_ID`
- `FIREBASE_TOKEN`은 환경변수(로컬에서 `npx firebase-tools login:ci`로 생성)
- **`firebase-tools`를 `@^15`로 고정**: v15는 아직 `FIREBASE_TOKEN`을 받지만 v16+에서는 제거된다. `@latest`를 쓰면 버전이 올라가는 날 깨진다.
- 업로드 실패로 build가 빨간색이 되지 않도록 감싸라——IPA는 이미 Artifacts에 안전히 있다.

## workflow 설정

- **Action = Archive**(Build가 아니다——Archive만 IPA 자동 내보내기를 트리거)
- **Signing → Automatic + 본인의 Apple Developer Team**
- **Environment**에 `FIREBASE_TOKEN` 추가
- 트리거는 `CI_START_CONDITION=push`(push로 build 발화). 수동으로 돌리려면: Xcode ⌘9 → Cloud → workflow 우클릭 → Start a Build

## 디버그 checklist

- `ci_post_clone.sh`가 안 돈다 → ci_scripts가 `ios/` 아래에 없다
- `ci_post_xcodebuild.sh`가 안 돈다 → 파일 이름이 `ci_post_archive`(존재하지 않음)이거나, workflow 액션이 Archive가 아니다
- `npm: command not found` / `pod: command not found` → clone 스크립트에서 `brew install node`를 안 했다
- `No signing certificate "iOS Distribution" found` → 수동으로 exportArchive 하고 있다. 삭제하라
- Firebase 업로드는 실패했는데 build는 초록 → 예상된 동작. 업로드는 베스트에포트고 IPA는 Artifacts에 있다
- IPA 파일을 손에 넣고 싶다 → Xcode Cloud Organizer → 해당 build → Artifacts → "YourApp 1.0 ad-hoc"
