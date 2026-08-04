React Native 프로젝트가 Xcode Cloud에서 테스트를 돌릴 때 첫 번째 관문은 CI 설정이 아니라, **프로젝트에 네이티브 테스트 타깃이 아예 없다는 것**이다. RN이 기본으로 생성하는 iOS 프로젝트에는 app 타깃 하나뿐이며, scheme의 Test Action조차 존재하지 않는 blueprint를 가리키고 있을 수 있다(고아 참조). 그래서 먼저 UI Test Bundle 타깃을 0부터 만들고, 로컬에서 smoke를 통과시킨 뒤, Xcode Cloud의 Test action이 그것을 돌리게 해야 한다.

이 글은 검증된 체인을 기록한 것이다: 명령줄에서 `xcodeproj` gem으로 UITest 타깃을 만들고(Xcode GUI는 클릭하지 않는다) → 로컬 smoke가 초록 → Xcode Cloud에 Test action 추가 → 클라우드에서 첫 빌드 통과. 그리고 타깃 생성 과정에서 gem은 자동으로 설정하지 않지만 Xcode GUI는 자동으로 설정하는 3개의 build settings 대함정도 함께.

## 먼저 진단: 테스트 타깃이 정말 있는지

"Xcode에 보인다"에 의존하지 마라. `project.pbxproj`를 직접 뒤진다:

```bash
# NativeTarget이 몇 개인지 확인
grep -c "isa = PBXNativeTarget" ios/YourApp.xcodeproj/project.pbxproj
# scheme의 TestAction이 무엇을 참조하는지 확인
grep -A2 "TestAction" ios/YourApp.xcodeproj/xcshareddata/xcschemes/*.xcscheme
```

RN 프로젝트는 기본적으로 PBXNativeTarget 1개(app)뿐이지만, scheme의 TestAction에는 `BlueprintName = "YourAppTests"`가 걸려 있을 수 있다——해당 타깃은 sanitize되거나 마이그레이션 과정에서 삭제됐고 참조만 남은 것이다. 이것이 고아다: Xcode Cloud의 Test action이 돌면 test target을 찾을 수 없다고 에러를 낸다.

결론: 0부터 만든다.

## 왜 타깃을 명령줄로 만드는가 (Xcode GUI가 아닌)

GUI로 만드는 게 가장 안정적이지만, 재현할 수 없고 버전 관리도 안 된다. 팀의 두 번째 사람이나 다른 머신에서는 또 한 번 클릭해야 한다. `xcodeproj` gem은 "타깃 만들기"를 커밋 가능한 스크립트로 바꿔준다——멱등적이고 diff가 된다.

대가: gem으로 만든 타깃은 **GUI가 자동으로 설정하는 build settings 몇 개를 자동으로 설정하지 않는다**——이것이 뒤에 나올 3개 함정의 근원이다.

## 타깃 만들기 (xcodeproj gem 스크립트)

```ruby
require 'xcodeproj'
project = Xcodeproj::Project.open('ios/YourApp.xcodeproj')

app = project.targets.find { |t| t.name == 'YourApp' }
abort 'app target을 찾을 수 없음' unless app

test = project.new_target(:ui_test_bundle, 'YourAppUITests', :ios, '15.1')
test.add_dependency(app)
test.build_configurations.each do |c|
  c.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = 'com.yourcompany.YourAppUITests'
  c.build_settings['TEST_TARGET_NAME']          = 'YourApp'      # UITest가 테스트할 app
  c.build_settings['DEVELOPMENT_TEAM']          = 'YOUR_TEAM_ID'
  c.build_settings['CODE_SIGN_STYLE']           = 'Automatic'
  c.build_settings['SWIFT_VERSION']             = '5.0'
end

# smoke 소스 파일 참조 (물리 파일은 먼저 만들어둘 것)
group    = project.main_group.new_group('YourAppUITests', 'YourAppUITests')
file_ref = group.new_file('YourAppUITests.swift')
test.add_file_references([file_ref])
project.save

# scheme: test action = UITests, launch = app
scheme = Xcodeproj::XCScheme.new
scheme.add_build_target(test)
scheme.add_build_target(app)
scheme.add_test_target(test)
scheme.set_launch_target(app)
scheme.save_as('ios/YourApp.xcodeproj', 'YourAppUITests', true)
```

핵심 포인트: `TEST_TARGET_NAME`은 피테스트 app을 가리킨다(UI test runner가 어떤 app을 띄울지 알아야 한다); `:unit_test_bundle`이 아니라 `:ui_test_bundle`을 쓴다(UI 테스트는 전자를 쓴다).

## ★ 큰 함정: gem이 자동으로 설정하지 않는 3개의 build settings

스크립트가 끝나고 `pod install`까지 마쳤는데 `xcodebuild test` 한 방에 함정에 부딪힌다. GUI로 타깃을 만들 때 Xcode가 자동으로 채워주는 이 3개를 gem은 채워주지 않는다.

### 함정 1 · Info.plist 누락 → 코드 서명 실패

```
Cannot code sign because the target does not have an Info.plist file
```

GUI로 타깃을 만들 때 Xcode는 `GENERATE_INFOPLST_FILE = YES`를 자동으로 설정한다(빌드 시 plist를 합성). gem은 설정하지 않아서 서명이 plist를 찾지 못하고 죽는다.

```ruby
c.build_settings['GENERATE_INFOPLST_FILE'] = 'YES'
c.build_settings['CURRENT_PROJECT_VERSION'] = '1'
c.build_settings['MARKETING_VERSION']       = '1.0'
```

### 함정 2 · RN codegen 스크립트가 test 타깃에 새어 들어감 → 산출물 충돌

```
error: Multiple commands produce '.../YourAppUITests-Runner.app/PlugIns/YourAppUITests.xctest'
```

원인: React Native의 codegen이 타깃에 `PBXShellScriptBuildPhase`(시작 스크립트)를 끼워 넣는다. gem으로 만든 test 타깃이 이 phase를 상속받으면, test runner의 기본 산출물 경로와 충돌해 산출물이 중복된다.

수정: 타깃을 만든 뒤 거기 섞여 들어온 shell script build phase를 삭제한다:

```ruby
test.shell_script_build_phases.each { |p| test.build_phases.delete(p) }
```

또는 pbxproj에서 test 타깃 아래의 `isa = PBXShellScriptBuildPhase` 세그먼트를 직접 지운다.

### 함정 3 · PRODUCT_NAME 비어 있음 → .xctest 산출물명 오류

```
Multiple commands produce '.../PlugIns/.xctest'   # 주의: .xctest 앞 이름이 비어 있음
```

gem으로 만든 타깃은 `PRODUCT_NAME`을 명시적으로 설정하지 않을 수 있고, 그러면 산출물명이 비어 버린다.

```ruby
c.build_settings['PRODUCT_NAME'] = '$(TARGET_NAME)'   # 또는 명시적으로 'YourAppUITests'
```

이 세 함정은 근원이 같다: **Xcode GUI가 타깃을 만들 때 하는 "자동 뒷마무리"를 gem은 네 손에 맡긴다.** `xcodebuild test`를 한 번 돌리고, 에러 메시지에 따라 하나씩 채워 넣는다——다 채우고 나면 안정된다.

## smoke 테스트: app이 떠서 죽지 않는지

첫 smoke는 기능을 검사하지 않는다. **체인**만 검증한다: app이 시뮬레이터에서 뜨고, 메인 화면에 들어가고, 죽지 않는지.

```swift
import XCTest

final class YourAppUITests: XCTestCase {
    func testAppLaunches() throws {
        let app = XCUIApplication()
        app.launch()
        let appeared = app.buttons.firstMatch.waitForExistence(timeout: 10)
            || app.staticTexts.firstMatch.waitForExistence(timeout: 5)
        XCTAssertTrue(appeared, "app 시작 후 상호작용 가능한 요소가 있어야 함")
    }
}
```

왜 `buttons.firstMatch || staticTexts.firstMatch`를 쓰는가: RN 첫 화면은 순수 JS 렌더링일 수 있어서, 네이티브 층 첫 프레임엔 button이 없을 수 있지만 text는 반드시 있다. 10s+5s 이중 대기로 콜드스타트를 커버한다.

## Podfile: test 타깃 블록

메인 타깃 블록 뒤에 추가한다:

```ruby
target 'YourAppUITests' do
  inherit! :search_paths
end
```

`inherit! :search_paths`는 test 타깃이 메인 타깃의 검색 경로(headers / frameworks)만 상속하게 만들고, pods를 중복 link하지 않게 한다——그렇지 않으면 중복 심볼. 그 다음 `cd ios && pod install`.

## 로컬에서 통과

```bash
cd ios
xcodebuild test \
  -workspace YourApp.xcworkspace \
  -scheme YourApp \
  -destination 'platform=iOS Simulator,name=iPhone 15' \
  -only-testing:YourAppUITests
```

`** TEST SUCCEEDED **`가 나오면 로컬 체인 OK.

## 클라우드: Xcode Cloud에 Test action 추가

1. App Store Connect → 본인 app → Xcode Cloud → workflow(master/브랜치 감시)
2. Actions 구역에 **Test** action 추가(기존 Archive action은 유지)
3. 설정:
   - **Scheme은 본인의 UITests scheme 선택**(app scheme이 아니다——후자의 Test Action은 고아 참조라 돌릴 수 없다)
   - Destination: iPhone 시뮬레이터
   - Environment: 우선 아무것도 추가하지 않는다(smoke만)
4. Save

⚠️ **핵심**: Test action 추가 **이전에** push로 촉발된 build는 Archive만 돈다. 반드시 **Test action 추가 뒤에 새 build를 한 번 더 트리거**해야 test가 돈다. 이미 in-flight인 build는 보충 실행되지 않는다.

## 결과

처음 Test action을 단 클라우드 build: `TEST SUCCEEDED`, Archive까지 포함해 총 약 7분. Xcode Cloud의 Test action은 XCTest / XCUITest(네이티브 층)만 돌리고 jest는 돌리지 않는다——RN의 JS 단위테스트는 별도로 설정해야 한다(예: GitLab CI의 jest job을 병렬로).

## 실측: 시뮬레이터 4개 병렬, smoke 전부 초록

이 체인을 실제 RN 프로젝트 하나에서 통과시켰다: UITest scheme의 TestAction을 Release configuration으로 설정, smoke 케이스 `testAppLaunches`는 app이 떠서 죽지 않는지만 검증. push 뒤 Xcode Cloud가 자동 발화, Test action이 4개 destination(iPhone SE / 16 / 16 Pro / 16 Pro Max)에서 병렬로 돌아 전부 초록.

![Xcode Cloud 테스트 리포트 Gallery 뷰](/apple-dev/xcode-cloud-testing-gallery.png)
*testAppLaunches 4 passed runs, destination별로 그룹화, 각 그룹에 app 실행 화면이 한 장씩——이것이 바로 XCTAttachment를 keepAlways로 .xcresult에 밀어 넣은 스크린샷 증거다.*

실측에서 밟은 세 개의 자명하지 않은 포인트:

- **Release configuration이 Cloud에서는 UITest를 돌릴 수 있다**. 로컬 실기기에서 Release를 쓰면 `test bundles not available in Release configuration`에 부딪히지만, Xcode Cloud의 build-for-testing / test-without-building 분리 모드는 문제없다. TestAction에 Release를 직접 설정하면 된다.
- **스크린샷은 기본으로 남지 않는다, 명시적으로 살려둬야 한다**. XCTest의 attachment는 기본 `.deleteOnSuccess`다——테스트가 통과하면 지워져서 "통과했는데 이미지 없음"이 된다. `.keepAlways`로 바꿔야 .xcresult에 들어가고, Gallery 탭과 Xcode Organizer에서 볼 수 있다.
- **스크린샷은 Artifacts 탭에 없다**. Artifacts는 패키징 산출물만 나열한다(Logs / Test Products / .xcresult.zip). attachment는 .xcresult 패키지 안의 리소스다. 보려면 Tests → Gallery로 가거나, .xcresult를 다운로드해 `xcrun xcresulttool export attachments`로 내보낸다.

## 심화: 환경변수로 BDD 게이트

smoke는 베이스라인이라 매번 돈다. 하지만 실기기 BDD(UI 상호작용, 비즈니스 흐름)는 시간이 오래 걸리고 할당량을 잡아먹어서 매 build마다 돌면 안 된다. 환경변수로 게이트하는 것을 관례로 삼는다:

```swift
import XCTest

final class YourAppBDDTests: XCTestCase {
    func testLoginFlow() throws {
        // BDD 스위트는 RUN_BDD로 게이트; smoke는 게이트 안 함 (베이스라인은 항상 실행)
        try XCTSkipIf(ProcessInfo.processInfo.environment["RUN_BDD"] != "true",
                      "BDD 건너뜀 (기본값은 할당량 절약, 실행하려면 RUN_BDD=true 추가)")
        // ... 실제 BDD 단계
    }
}
```

클라우드 workflow의 Environment는 기본적으로 `RUN_BDD`를 **설정하지 않는다**(매번 smoke만); 상호작용/비즈니스를 검증할 때 임시로 `RUN_BDD=true`를 추가해 한 번 트리거한다. 할당량을 중요한 곳에 쓴다.

## 디버그 checklist

- `Cannot code sign ... does not have an Info.plist` → `GENERATE_INFOPLST_FILE = YES` 설정
- `Multiple commands produce ...-Runner.app/PlugIns/...xctest` → test 타깃에 섞인 codegen `PBXShellScriptBuildPhase` 삭제
- `Multiple commands produce .../PlugIns/.xctest`(이름 비어 있음) → `PRODUCT_NAME` 설정
- Test action이 test target을 찾을 수 없다고 에러 → scheme TestAction이 고아 참조, 새 UITests scheme을 만들어 선택
- 클라우드 build가 test를 안 돌림 → Test action 추가 뒤 build를 다시 트리거하지 않았음(예전 build는 보충 실행 안 됨)
- 시뮬레이터 destination을 못 찾음 → 클라우드 이미지에 실제 있는 모델(예: `iPhone Air`)을 쓴다. 갓 출시돼서 이미지가 아직 업데이트되지 않은 모델은 쓰지 마라
- `xcodebuild test` 컴파일이 오래 걸림 → RN 전량 컴파일 첫 회는 약 10분, 정상이니 백그라운드로 돌려두고 기다린다
