// Apple-developer recipe corpus (spec CHE-UNITBOX-APPLE-DEV-001).
// Separate from articles.ts so the conversion core stays untouched (A8).
//
// Recipe BODIES live as pure markdown under ./apple-dev-recipes/<slug>.<locale>.md.
// This keeps shell `$VAR` and ``` code fences out of TS template-string escaping.
// Metadata + HowTo steps + FAQ stay here as localized structured data.
// Rendered by src/lib/recipe.ts (NOT the articles formatInline-only path).

export interface Localized {
  en: string;
  'zh-hans': string;
  'zh-hant': string;
  ja: string;
  ko: string;
}

export interface RecipeStep {
  name: Localized;
  text: Localized;
}

export interface RecipeFaq {
  q: Localized;
  a: Localized;
}

export interface AppleDevArticle {
  slug: string;
  title: Localized;
  description: Localized;
  category: string;
  readTime: string;
  body: Localized;
  keywords: Localized;
  howto: { tool: Localized; steps: RecipeStep[] };
  faq: RecipeFaq[];
  publishedAt?: string;
  dateModified?: string;
}

// Load recipe bodies as raw strings at build time. Keys are the glob paths.
const recipeBodies = import.meta.glob<string>('./apple-dev-recipes/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function bodyFor(slug: string, locale: string): string {
  // Fall back: zh-hans is the primary source (spec D5); other locales return
  // zh-hans until their own .md is authored. Prevents build breakage when only
  // zh-hans is published first.
  const at = (lc: string) => recipeBodies[`./apple-dev-recipes/${slug}.${lc}.md`];
  const body = at(locale) || at('zh-hans') || at('en');
  if (!body) throw new Error(`Recipe body not found for slug: ${slug}`);
  return body;
}

export const appleDevArticles: AppleDevArticle[] = [
  {
    slug: 'xcode-cloud-rn-ipa-firebase',
    keywords: {
      en: 'React Native, Xcode Cloud, iOS IPA export, Firebase App Distribution, CI/CD, iOS build automation, Xcode Cloud free tier, over-the-air install',
      'zh-hans': 'React Native, Xcode Cloud, iOS 打包, IPA 导出, Firebase App Distribution, CI/CD, 免费出包, 自动化构建, OTA 安装',
      'zh-hant': 'React Native, Xcode Cloud, iOS 封裝, IPA 匯出, Firebase App Distribution, CI/CD, 免費出包, 自動化建置, OTA 安裝',
      ja: 'React Native, Xcode Cloud, iOS ビルド, IPA エクスポート, Firebase App Distribution, CI/CD, 無料ビルド, 自動化, OTA 配布',
      ko: 'React Native, Xcode Cloud, iOS 빌드, IPA 내보내기, Firebase App Distribution, CI/CD, 무료 빌드, 자동화, OTA 배포',
    },
    category: 'Xcode Cloud',
    readTime: '9 min',
    publishedAt: '2026-08-04',
    dateModified: '2026-08-04',
    title: {
      en: 'Xcode Cloud for React Native: ship IPAs to Firebase without the signing trap',
      'zh-hans': 'Xcode Cloud + React Native：把 IPA 发到 Firebase，绕开签名死结',
      'zh-hant': 'Xcode Cloud + React Native：把 IPA 發到 Firebase，繞開簽名死結',
      ja: 'Xcode Cloud + React Native：署名の罠を回避して IPA を Firebase に届ける',
      ko: 'Xcode Cloud + React Native: 서명 함정을 피해 IPA를 Firebase로 보내기',
    },
    description: {
      en: 'A verified pipeline for shipping a React Native IPA from Xcode Cloud to Firebase App Distribution — and the one manual exportArchive mistake that breaks every build.',
      'zh-hans': '一条已验证的链路：push 代码 → Xcode Cloud archive → 自动导出 IPA → Firebase 分发。以及那个会让所有 build 失败的手动 exportArchive 大坑。',
      'zh-hant': '一條已驗證的鏈路：push 程式碼 → Xcode Cloud archive → 自動匯出 IPA → Firebase 分發。以及那個會讓所有 build 失敗的手動 exportArchive 大坑。',
      ja: '検証済みのパイプライン：コードを push → Xcode Cloud で archive → IPA を自動エクスポート → Firebase で配信。そして、毎回必ず build をコケさせる手動 exportArchive の大きな落とし穴。',
      ko: '검증된 파이프라인: 코드를 push → Xcode Cloud에서 archive → IPA 자동 내보내기 → Firebase로 배포. 그리고 매번 build를 실패하게 만드는 수동 exportArchive의 큰 함정.',
    },
    body: {
      en: bodyFor('xcode-cloud-rn-ipa-firebase', 'en'),
      'zh-hans': bodyFor('xcode-cloud-rn-ipa-firebase', 'zh-hans'),
      'zh-hant': bodyFor('xcode-cloud-rn-ipa-firebase', 'zh-hant'),
      ja: bodyFor('xcode-cloud-rn-ipa-firebase', 'ja'),
      ko: bodyFor('xcode-cloud-rn-ipa-firebase', 'ko'),
    },
    howto: {
      tool: {
        en: 'Xcode Cloud, Firebase App Distribution, and the firebase-tools CLI.',
        'zh-hans': 'Xcode Cloud、Firebase App Distribution、firebase-tools CLI。',
        'zh-hant': 'Xcode Cloud、Firebase App Distribution、firebase-tools CLI。',
        ja: 'Xcode Cloud、Firebase App Distribution、firebase-tools CLI。',
        ko: 'Xcode Cloud, Firebase App Distribution, firebase-tools CLI.',
      },
      steps: [
        {
          name: {
            en: 'Put ci_scripts under ios/ci_scripts/',
            'zh-hans': '把 ci_scripts 放到 ios/ci_scripts/',
            'zh-hant': '把 ci_scripts 放到 ios/ci_scripts/',
            ja: 'ci_scripts は ios/ci_scripts/ に置く',
            ko: 'ci_scripts는 ios/ci_scripts/ 아래에 둘 것',
          },
          text: {
            en: 'Xcode Cloud resolves ci_scripts relative to the .xcodeproj. In a React Native project that lives in ios/, so the scripts go to ios/ci_scripts/. A ci_scripts/ at the repo root will not be found.',
            'zh-hans': 'Xcode Cloud 相对 .xcodeproj 查找 ci_scripts。RN 项目的 .xcodeproj 在 ios/ 下，所以脚本要放 ios/ci_scripts/。放 repo 根目录不会被找到。',
            'zh-hant': 'Xcode Cloud 相對 .xcodeproj 查找 ci_scripts。RN 專案的 .xcodeproj 在 ios/ 下，所以腳本要放 ios/ci_scripts/。放 repo 根目錄不會被找到。',
            ja: 'Xcode Cloud は .xcodeproj を基準に ci_scripts を探す。RN プロジェクトの .xcodeproj は ios/ にあるので、スクリプトは ios/ci_scripts/ に置く。repo のルートに置いても見つからない。',
            ko: 'Xcode Cloud는 .xcodeproj를 기준으로 ci_scripts를 찾는다. RN 프로젝트의 .xcodeproj는 ios/ 안에 있으므로, 스크립트는 ios/ci_scripts/에 둬야 한다. repo 루트에 두면 찾지 못한다.',
          },
        },
        {
          name: {
            en: 'Install node and dependencies in ci_post_clone.sh',
            'zh-hans': '在 ci_post_clone.sh 装 node 和依赖',
            'zh-hant': '在 ci_post_clone.sh 裝 node 和依賴',
            ja: 'ci_post_clone.sh で node と依存関係をインストール',
            ko: 'ci_post_clone.sh에서 node와 의존성 설치',
          },
          text: {
            en: 'The Cloud image has no node — brew install node, then npm ci and cd ios && pod install. CocoaPods 1.17 is pre-installed. Pin firebase-tools later, not here.',
            'zh-hans': 'Cloud 镜像没有 node——brew install node，然后 npm ci 和 cd ios && pod install。CocoaPods 1.17 已预装。firebase-tools 版本到后面再钉。',
            'zh-hant': 'Cloud 映像沒有 node——brew install node，然後 npm ci 和 cd ios && pod install。CocoaPods 1.17 已預裝。firebase-tools 版本到後面再錨定。',
            ja: 'Cloud のイメージには node がない——brew install node、そのあと npm ci と cd ios && pod install。CocoaPods 1.17 はプリインストール済み。firebase-tools のバージョンはここではなく後で固定する。',
            ko: 'Cloud 이미지에는 node가 없다——brew install node, 그 다음 npm ci와 cd ios && pod install. CocoaPods 1.17은 미리 깔려 있다. firebase-tools 버전은 여기가 아니라 나중에 고정한다.',
          },
        },
        {
          name: {
            en: 'Grab the IPA Cloud exported and upload in ci_post_xcodebuild.sh',
            'zh-hans': '在 ci_post_xcodebuild.sh 拿 Cloud 导出的 IPA 并上传',
            'zh-hant': '在 ci_post_xcodebuild.sh 拿 Cloud 匯出的 IPA 並上傳',
            ja: 'ci_post_xcodebuild.sh で Cloud がエクスポートした IPA を拾ってアップロード',
            ko: 'ci_post_xcodebuild.sh에서 Cloud가 내보낸 IPA를 가져와 업로드',
          },
          text: {
            en: 'Guard at the top so only Archive proceeds. Then find the ad-hoc IPA Cloud already exported, and run `npx firebase-tools@^15 appdistribution:distribute`. Never call `xcodebuild -exportArchive` yourself — Cloud already exported the IPA.',
            'zh-hans': '开头加判断，只有 Archive 才继续。然后 find 出 Cloud 已经导出的 ad-hoc IPA，跑 `npx firebase-tools@^15 appdistribution:distribute`。永远别自己调 `xcodebuild -exportArchive`——Cloud 已经导出好 IPA 了。',
            'zh-hant': '開頭加判斷，只有 Archive 才繼續。然後 find 出 Cloud 已經匯出的 ad-hoc IPA，跑 `npx firebase-tools@^15 appdistribution:distribute`。永遠別自己呼叫 `xcodebuild -exportArchive`——Cloud 已經匯出好 IPA 了。',
            ja: '先頭でガードを入れ、Archive のときだけ進むようにする。そのあと Cloud が既にエクスポートした ad-hoc IPA を find で拾い、`npx firebase-tools@^15 appdistribution:distribute` を実行する。`xcodebuild -exportArchive` は絶対に自分で呼ばない——Cloud が既に IPA をエクスポート済みだから。',
            ko: '맨 위에 가드를 넣어 Archive일 때만 진행되게 한다. 그 다음 Cloud가 이미 내보낸 ad-hoc IPA를 find로 찾아, `npx firebase-tools@^15 appdistribution:distribute`를 실행한다. `xcodebuild -exportArchive`는 절대 직접 호출하지 마라——Cloud가 이미 IPA를 내보냈다.',
          },
        },
        {
          name: {
            en: 'Set the workflow to Archive and add FIREBASE_TOKEN',
            'zh-hans': 'workflow 选 Archive 并加 FIREBASE_TOKEN',
            'zh-hant': 'workflow 選 Archive 並加 FIREBASE_TOKEN',
            ja: 'workflow を Archive にして FIREBASE_TOKEN を追加',
            ko: 'workflow를 Archive로 설정하고 FIREBASE_TOKEN 추가',
          },
          text: {
            en: 'Action = Archive (only Archive triggers IPA auto-export), Signing = Automatic + your team, and add FIREBASE_TOKEN (from npx firebase-tools login:ci) as an environment variable.',
            'zh-hans': 'Action = Archive（只有 Archive 触发 IPA 自动导出），Signing = Automatic + 你的 team，FIREBASE_TOKEN（npx firebase-tools login:ci 生成）加到环境变量。',
            'zh-hant': 'Action = Archive（只有 Archive 觸發 IPA 自動匯出），Signing = Automatic + 你的 team，FIREBASE_TOKEN（npx firebase-tools login:ci 產生）加到環境變數。',
            ja: 'Action = Archive（Archive のみが IPA の自動エクスポートをトリガーする）、Signing = Automatic + 自分のチーム、FIREBASE_TOKEN（npx firebase-tools login:ci で生成）を環境変数に追加。',
            ko: 'Action = Archive(Archive만 IPA 자동 내보내기를 트리거), Signing = Automatic + 본인의 team, FIREBASE_TOKEN(npx firebase-tools login:ci로 생성)을 환경변수로 추가.',
          },
        },
      ],
    },
    faq: [
      {
        q: {
          en: 'Why does my manual xcodebuild -exportArchive always fail with no signing certificate?',
          'zh-hans': '为什么我手动 xcodebuild -exportArchive 总是报找不到签名证书？',
          'zh-hant': '為什麼我手動 xcodebuild -exportArchive 總是報找不到簽章憑證？',
          ja: '手動で xcodebuild -exportArchive すると、なぜ毎回「署名証明書が見つからない」とエラーになるのか？',
          ko: '수동으로 xcodebuild -exportArchive 하면 왜 매번 서명 인증서를 찾을 수 없다고 뜨나?',
        },
        a: {
          en: 'Because Xcode Cloud signs the auto-exported IPA through an internal proxy at localhost:6667 that your script cannot see. Delete the manual exportArchive call and use the IPA Cloud already exported under /Volumes/workspace/adhocexport/.',
          'zh-hans': '因为 Xcode Cloud 用一个内部签名代理（localhost:6667）签自动导出的 IPA，这个代理你的脚本看不到。删掉手动 exportArchive，用 Cloud 已经导出在 /Volumes/workspace/adhocexport/ 的 IPA。',
          'zh-hant': '因為 Xcode Cloud 用一個內部簽章代理（localhost:6667）簽自動匯出的 IPA，這個代理你的腳本看不到。刪掉手動 exportArchive，用 Cloud 已經匯出在 /Volumes/workspace/adhocexport/ 的 IPA。',
          ja: 'Xcode Cloud は内部の署名プロキシ（localhost:6667）経由で自動エクスポートした IPA に署名するが、このプロキシはあなたのスクリプトからは見えない。手動の exportArchive 呼び出しを削除し、Cloud が /Volumes/workspace/adhocexport/ に既にエクスポートした IPA を使う。',
          ko: 'Xcode Cloud가 내부 서명 프록시(localhost:6667)를 거쳐 자동 내보내기한 IPA에 서명하는데, 이 프록시는 네 스크립트에서 보이지 않기 때문이다. 수동 exportArchive 호출을 삭제하고, Cloud가 /Volumes/workspace/adhocexport/ 아래에 이미 내보낸 IPA를 써라.',
        },
      },
      {
        q: {
          en: 'Why does my ci_post_archive.sh not run?',
          'zh-hans': 'ci_post_archive.sh 为什么不执行？',
          'zh-hant': 'ci_post_archive.sh 為什麼不執行？',
          ja: 'ci_post_archive.sh が実行されないのはなぜ？',
          ko: 'ci_post_archive.sh가 왜 실행되지 않나?',
        },
        a: {
          en: 'There is no ci_post_archive.sh hook. Xcode Cloud has only three hooks: ci_post_clone, ci_pre_xcodebuild, ci_post_xcodebuild. After the Archive action, the hook that fires is ci_post_xcodebuild.sh.',
          'zh-hans': '没有 ci_post_archive.sh 这个钩子。Xcode Cloud 只有三个钩子：ci_post_clone、ci_pre_xcodebuild、ci_post_xcodebuild。Archive 之后触发的是 ci_post_xcodebuild.sh。',
          'zh-hant': '沒有 ci_post_archive.sh 這個鉤子。Xcode Cloud 只有三個鉤子：ci_post_clone、ci_pre_xcodebuild、ci_post_xcodebuild。Archive 之後觸發的是 ci_post_xcodebuild.sh。',
          ja: 'ci_post_archive.sh というフックは存在しない。Xcode Cloud にあるのは ci_post_clone、ci_pre_xcodebuild、ci_post_xcodebuild の 3 つだけ。Archive アクションの後に発火するのは ci_post_xcodebuild.sh。',
          ko: 'ci_post_archive.sh라는 훅은 없다. Xcode Cloud에 있는 훅은 ci_post_clone, ci_pre_xcodebuild, ci_post_xcodebuild 세 개뿐. Archive 액션 이후에 발화하는 훅은 ci_post_xcodebuild.sh다.',
        },
      },
      {
        q: {
          en: 'Should I pin the firebase-tools version?',
          'zh-hans': 'firebase-tools 要不要钉版本？',
          'zh-hant': 'firebase-tools 要不要錨定版本？',
          ja: 'firebase-tools のバージョンは固定すべき？',
          ko: 'firebase-tools 버전을 고정해야 하나?',
        },
        a: {
          en: 'Yes — pin @^15. v15 still accepts the FIREBASE_TOKEN env var; v16+ removes it. Using @latest will break your pipeline the day firebase-tools bumps to v16.',
          'zh-hans': '要，钉 @^15。v15 还支持 FIREBASE_TOKEN 环境变量，v16+ 就移除了。用 @latest 哪天升到 v16 你的流水线就挂。',
          'zh-hant': '要，錨定 @^15。v15 還支援 FIREBASE_TOKEN 環境變數，v16+ 就移除了。用 @latest 哪天升到 v16 你的流水線就掛。',
          ja: 'すべき。@^15 で固定する。v15 はまだ FIREBASE_TOKEN 環境変数を受け付けるが、v16+ では削除される。@latest を使っていると、firebase-tools が v16 に上がった日にパイプラインが壊れる。',
          ko: '그래, @^15로 고정하라. v15는 아직 FIREBASE_TOKEN 환경변수를 받지만 v16+에서는 제거된다. @latest를 쓰면 firebase-tools가 v16으로 올라가는 날 파이프라인이 깨진다.',
        },
      },
      {
        q: {
          en: 'Where do ci_scripts go in a React Native project?',
          'zh-hans': 'React Native 项目的 ci_scripts 放哪里？',
          'zh-hant': 'React Native 專案的 ci_scripts 放哪裡？',
          ja: 'React Native プロジェクトで ci_scripts はどこに置く？',
          ko: 'React Native 프로젝트에서 ci_scripts는 어디에 두나?',
        },
        a: {
          en: 'In ios/ci_scripts/. Xcode Cloud resolves ci_scripts relative to the .xcodeproj, and in a React Native project the .xcodeproj is inside the ios/ directory. A ci_scripts/ at the repo root will not be found.',
          'zh-hans': '放 ios/ci_scripts/。Xcode Cloud 相对 .xcodeproj 查找 ci_scripts，RN 项目的 .xcodeproj 在 ios/ 目录里。放 repo 根目录不会被识别。',
          'zh-hant': '放 ios/ci_scripts/。Xcode Cloud 相對 .xcodeproj 查找 ci_scripts，RN 專案的 .xcodeproj 在 ios/ 目錄裡。放 repo 根目錄不會被識別。',
          ja: 'ios/ci_scripts/ に置く。Xcode Cloud は .xcodeproj を基準に ci_scripts を探し、RN プロジェクトの .xcodeproj は ios/ ディレクトリの中にある。repo のルートに置いた ci_scripts/ は認識されない。',
          ko: 'ios/ci_scripts/에 둔다. Xcode Cloud는 .xcodeproj를 기준으로 ci_scripts를 찾고, RN 프로젝트의 .xcodeproj는 ios/ 디렉토리 안에 있다. repo 루트의 ci_scripts/는 인식되지 않는다.',
        },
      },
    ],
  },
  {
    slug: 'xcode-cloud-testing',
    keywords: {
      en: 'Xcode Cloud, React Native testing, UITest, XCUITest, iOS test target, automated UI testing, xcodeproj gem, continuous testing',
      'zh-hans': 'Xcode Cloud, React Native 测试, UITest, XCUITest, 测试 target, UI 自动化测试, xcodeproj, 持续测试',
      'zh-hant': 'Xcode Cloud, React Native 測試, UITest, XCUITest, 測試 target, UI 自動化測試, xcodeproj, 持續測試',
      ja: 'Xcode Cloud, React Native テスト, UITest, XCUITest, テスト target, UI 自動テスト, xcodeproj, 継続テスト',
      ko: 'Xcode Cloud, React Native 테스트, UITest, XCUITest, 테스트 target, UI 자동화 테스트, xcodeproj, 지속 테스트',
    },
    category: 'Xcode Cloud',
    readTime: '8 min',
    publishedAt: '2026-08-04',
    dateModified: '2026-08-04',
    title: {
      en: 'Xcode Cloud testing for React Native: build a UITest target from scratch',
      'zh-hans': 'Xcode Cloud 给 React Native 跑测试：从 0 命令行建 UITest target',
      'zh-hant': 'Xcode Cloud 為 React Native 跑測試：從 0 命令列建 UITest target',
      ja: 'Xcode Cloud で React Native のテストを走らせる：UITest target をゼロから CLI で作る',
      ko: 'Xcode Cloud에서 React Native 테스트 실행: UITest target을 0부터 CLI로 만들기',
    },
    description: {
      en: 'A React Native project ships with no native test target. Here is a verified path: build the UITest target from the command line with the xcodeproj gem, pass a smoke test locally, add a Test action in Xcode Cloud. Plus the three build settings the gem forgets and Xcode sets automatically.',
      'zh-hans': 'RN 项目默认没有原生测试 target。一条已验证的链路：命令行用 xcodeproj gem 建 UITest target → 本地跑 smoke 绿 → Xcode Cloud 加 Test action → 云端首次跑通。以及 gem 不会自动设、Xcode GUI 会自动设的 3 个 build settings 大坑。',
      'zh-hant': 'RN 專案預設沒有原生測試 target。一條已驗證的鏈路：命令列用 xcodeproj gem 建 UITest target → 本地跑 smoke 綠 → Xcode Cloud 加 Test action → 雲端首次跑通。以及 gem 不會自動設、Xcode GUI 會自動設的 3 個 build settings 大坑。',
      ja: 'RN プロジェクトはデフォルトでネイティブのテスト target を持たない。検証済みのパス：CLI の xcodeproj gem で UITest target を作る → ローカルで smoke が通る → Xcode Cloud に Test action を追加 → クラウドで初回成功。さらに gem が自動設定せず、Xcode の GUI が自動設定する 3 つの build settings の落とし穴。',
      ko: 'RN 프로젝트는 기본적으로 네이티브 테스트 target이 없다. 검증된 경로: CLI의 xcodeproj gem으로 UITest target을 만든다 → 로컬에서 smoke 통과 → Xcode Cloud에 Test action 추가 → 클라우드에서 첫 실행 성공. 더불어 gem은 자동 설정하지 않고 Xcode GUI는 자동 설정하는 3개의 build settings 함정.',
    },
    body: {
      en: bodyFor('xcode-cloud-testing', 'en'),
      'zh-hans': bodyFor('xcode-cloud-testing', 'zh-hans'),
      'zh-hant': bodyFor('xcode-cloud-testing', 'zh-hant'),
      ja: bodyFor('xcode-cloud-testing', 'ja'),
      ko: bodyFor('xcode-cloud-testing', 'ko'),
    },
    howto: {
      tool: {
        en: 'The xcodeproj Ruby gem, Xcode Cloud, and the Test action in App Store Connect.',
        'zh-hans': 'xcodeproj Ruby gem、Xcode Cloud、App Store Connect 的 Test action。',
        'zh-hant': 'xcodeproj Ruby gem、Xcode Cloud、App Store Connect 的 Test action。',
        ja: 'xcodeproj Ruby gem、Xcode Cloud、App Store Connect の Test action。',
        ko: 'xcodeproj Ruby gem, Xcode Cloud, App Store Connect의 Test action.',
      },
      steps: [
        {
          name: {
            en: 'Confirm whether you already have a test target',
            'zh-hans': '先确认项目有没有测试 target',
            'zh-hant': '先確認專案有沒有測試 target',
            ja: 'テスト target が既にあるか確認する',
            ko: '테스트 target이 이미 있는지 확인',
          },
          text: {
            en: 'Do not trust what Xcode shows. grep project.pbxproj for the PBXNativeTarget count and inspect the scheme TestAction. A React Native project ships with one app target, and the scheme may reference a test blueprint whose target was deleted — an orphan that breaks the Test action.',
            'zh-hans': '别信 Xcode 里看着有。grep project.pbxproj 看 PBXNativeTarget 个数、看 scheme 的 TestAction。RN 项目默认只有一个 app target，scheme 可能引用一个已被删的 test blueprint（孤儿引用），Test action 一跑就挂。',
            'zh-hant': '別信 Xcode 裡看著有。grep project.pbxproj 看 PBXNativeTarget 個數、看 scheme 的 TestAction。RN 專案預設只有一個 app target，scheme 可能引用一個已被刪的 test blueprint（孤兒引用），Test action 一跑就掛。',
            ja: 'Xcode の表示を信じない。project.pbxproj を grep して PBXNativeTarget の数を確認し、scheme の TestAction を調べる。RN プロジェクトは app target 1 つだけがデフォルトで、scheme が既に削除された test blueprint（孤児参照）を引いていることがあり、Test action が即座にコケる。',
            ko: 'Xcode에 보이는 것을 믿지 마라. project.pbxproj를 grep해 PBXNativeTarget 개수를 확인하고 scheme의 TestAction을 조사하라. RN 프로젝트는 app target 하나가 기본이며, scheme이 이미 삭제된 test blueprint(고아 참조)를 가리키고 있어 Test action이 바로 실패할 수 있다.',
          },
        },
        {
          name: {
            en: 'Build the UITest target with the xcodeproj gem',
            'zh-hans': '用 xcodeproj gem 建 UITest target',
            'zh-hant': '用 xcodeproj gem 建 UITest target',
            ja: 'xcodeproj gem で UITest target を作る',
            ko: 'xcodeproj gem으로 UITest target 만들기',
          },
          text: {
            en: 'A script that calls new_target(:ui_test_bundle, ...) plus add_test_target / set_launch_target produces a reproducible, diffable target and scheme — no Xcode GUI clicking. Set TEST_TARGET_NAME to the app being tested.',
            'zh-hans': '一个调 new_target(:ui_test_bundle, ...) + add_test_target / set_launch_target 的脚本，生成可复现、可 diff 的 target 和 scheme——不用点 Xcode GUI。TEST_TARGET_NAME 指向被测 app。',
            'zh-hant': '一個呼叫 new_target(:ui_test_bundle, ...) + add_test_target / set_launch_target 的腳本，產生可重現、可 diff 的 target 和 scheme——不用點 Xcode GUI。TEST_TARGET_NAME 指向被測 app。',
            ja: 'new_target(:ui_test_bundle, ...) と add_test_target / set_launch_target を呼ぶスクリプトで、再現可能で diff できる target と scheme ができる——Xcode の GUI 操作は不要。TEST_TARGET_NAME に被測 app を指定する。',
            ko: 'new_target(:ui_test_bundle, ...)와 add_test_target / set_launch_target을 호출하는 스크립트로, 재현 가능하고 diff할 수 있는 target과 scheme이 만들어진다——Xcode GUI 클릭 불필요. TEST_TARGET_NAME에 피테스트 app을 지정한다.',
          },
        },
        {
          name: {
            en: 'Fill in the three build settings the gem skips',
            'zh-hans': '补上 gem 漏掉的 3 个 build settings',
            'zh-hant': '補上 gem 漏掉的 3 個 build settings',
            ja: 'gem がスキップする 3 つの build settings を埋める',
            ko: 'gem이 건너뛰는 3개의 build settings 채우기',
          },
          text: {
            en: 'Xcode auto-sets these when you add a target via GUI; the gem does not. Set GENERATE_INFOPLIST_FILE=YES (or code-signing fails on a missing Info.plist), strip the React Native codegen PBXShellScriptBuildPhase that leaks into the test target (or you get duplicate .xctest products), and set PRODUCT_NAME (or the product name comes out empty).',
            'zh-hans': 'GUI 建 target 时 Xcode 自动设这 3 个，gem 不会。设 GENERATE_INFOPLIST_FILE=YES（否则缺 Info.plist 签名挂）、删掉泄进 test target 的 RN codegen PBXShellScriptBuildPhase（否则 .xctest 产物重复）、设 PRODUCT_NAME（否则产物名落空）。',
            'zh-hant': 'GUI 建 target 時 Xcode 自動設這 3 個，gem 不會。設 GENERATE_INFOPLIST_FILE=YES（否則缺 Info.plist 簽名掛）、刪掉洩進 test target 的 RN codegen PBXShellScriptBuildPhase（否則 .xctest 產物重複）、設 PRODUCT_NAME（否則產物名落空）。',
            ja: 'GUI で target を作ると Xcode がこの 3 つを自動設定するが、gem はしない。GENERATE_INFOPLIST_FILE=YES を設定（さもないと Info.plist 不足で署名がコケる）、test target に漏れ込む RN codegen の PBXShellScriptBuildPhase を削除（さもないと .xctest 産物が重複）、PRODUCT_NAME を設定（さもないと産物名が空になる）。',
            ko: 'GUI로 target을 만들면 Xcode가 이 3개를 자동 설정하지만 gem은 그러지 않는다. GENERATE_INFOPLIST_FILE=YES 설정(안 하면 Info.plist 부족으로 서명 실패), test target에 새어 들어간 RN codegen PBXShellScriptBuildPhase 삭제(안 하면 .xctest 산물 중복), PRODUCT_NAME 설정(안 하면 산물명이 비어짐).',
          },
        },
        {
          name: {
            en: 'Run smoke locally, then add a Test action in Xcode Cloud',
            'zh-hans': '本地跑 smoke，再在 Xcode Cloud 加 Test action',
            'zh-hant': '本地跑 smoke，再在 Xcode Cloud 加 Test action',
            ja: 'ローカルで smoke を走らせ、Xcode Cloud に Test action を追加',
            ko: '로컬에서 smoke을 실행한 뒤 Xcode Cloud에 Test action 추가',
          },
          text: {
            en: 'Run xcodebuild test locally to confirm the link works. Then in App Store Connect add a Test action that selects the UITests scheme, and trigger a fresh build — a build already in flight when you add the action will not pick it up.',
            'zh-hans': '本地 xcodebuild test 确认链路通。然后在 ASC 加 Test action（scheme 选 UITests），再触发一次新 build——加 action 时已在跑的旧 build 不会补跑 test。',
            'zh-hant': '本地 xcodebuild test 確認鏈路通。然後在 ASC 加 Test action（scheme 選 UITests），再觸發一次新 build——加 action 時已在跑的舊 build 不會補跑 test。',
            ja: 'ローカルで xcodebuild test を走らせてリンクを確認。その後 ASC で Test action（scheme は UITests を選択）を追加し、新しい build を再トリガーする——action 追加時に既に走っていた build には反映されない。',
            ko: '로컬에서 xcodebuild test로 연결을 확인한다. 그런 뒤 ASC에서 Test action(scheme은 UITests 선택)을 추가하고 새 build를 다시 트리거한다——action 추가 시 이미 실행 중이던 build에는 반영되지 않는다.',
          },
        },
      ],
    },
    faq: [
      {
        q: {
          en: 'Why does the gem-created target fail to code-sign with no Info.plist?',
          'zh-hans': '为什么 gem 建的 target 报缺 Info.plist、签名失败？',
          'zh-hant': '為什麼 gem 建的 target 報缺 Info.plist、簽名失敗？',
          ja: 'gem で作った target が Info.plist 不足で署名に失敗するのはなぜ？',
          ko: 'gem으로 만든 target이 Info.plist 부족으로 서명에 실패하는 이유는?',
        },
        a: {
          en: 'Xcode sets GENERATE_INFOPLIST_FILE=YES automatically when you add a target via GUI; the xcodeproj gem does not. Without it the target has no Info.plist and signing fails. Set it explicitly in build_settings.',
          'zh-hans': 'GUI 建 target 时 Xcode 自动设 GENERATE_INFOPLIST_FILE=YES，xcodeproj gem 不会。不设就没 Info.plist，签名挂。在 build_settings 里显式设上。',
          'zh-hant': 'GUI 建 target 時 Xcode 自動設 GENERATE_INFOPLIST_FILE=YES，xcodeproj gem 不會。不設就沒 Info.plist，簽名掛。在 build_settings 裡顯式設上。',
          ja: 'GUI で target を作ると Xcode が GENERATE_INFOPLIST_FILE=YES を自動設定するが、xcodeproj gem はしない。設定しないと Info.plist が無く、署名がコケる。build_settings で明示的に設定する。',
          ko: 'GUI로 target을 만들면 Xcode가 GENERATE_INFOPLIST_FILE=YES를 자동 설정하지만 xcodeproj gem은 그러지 않는다. 설정하지 않으면 Info.plist가 없어 서명이 실패한다. build_settings에서 명시적으로 설정하라.',
        },
      },
      {
        q: {
          en: 'What does "Multiple commands produce ...-Runner.app/PlugIns/....xctest" mean?',
          'zh-hans': '“Multiple commands produce ...-Runner.app/PlugIns/....xctest” 是什么意思？',
          'zh-hant': '「Multiple commands produce ...-Runner.app/PlugIns/....xctest」是什麼意思？',
          ja: '「Multiple commands produce ...-Runner.app/PlugIns/....xctest」とは？',
          ko: '"Multiple commands produce ...-Runner.app/PlugIns/....xctest"는 무슨 뜻?',
        },
        a: {
          en: 'The React Native codegen injects a PBXShellScriptBuildPhase into targets, and it leaks into the test target, colliding with the runner default product path. Remove the shell-script build phase from the test target (or delete that section in pbxproj) and the duplicate goes away.',
          'zh-hans': 'RN 的 codegen 会往 target 塞 PBXShellScriptBuildPhase，泄进 test target 后和 runner 默认产物路径打架。把 test target 上的这个 shell script build phase 删掉（或在 pbxproj 里删掉那段），产物重复就没了。',
          'zh-hant': 'RN 的 codegen 會往 target 塞 PBXShellScriptBuildPhase，洩進 test target 後和 runner 預設產物路徑打架。把 test target 上的這個 shell script build phase 刪掉（或在 pbxproj 裡刪掉那段），產物重複就沒了。',
          ja: 'RN の codegen が target に PBXShellScriptBuildPhase を注入し、それが test target に漏れて runner のデフォルト産物パスと衝突する。test target 上のこの shell script build phase を削除（または pbxproj の該当セクションを削除）すれば重複は消える。',
          ko: 'RN의 codegen이 target에 PBXShellScriptBuildPhase를 주입하고, 그것이 test target에 새어 들어가 runner의 기본 산물 경로와 충돌한다. test target의 이 shell script build phase를 삭제(또는 pbxproj에서 해당 섹션 삭제)하면 중복이 사라진다.',
        },
      },
      {
        q: {
          en: 'I added a Test action but the build did not run any tests. Why?',
          'zh-hans': '我加了 Test action，但 build 没跑测试，为什么？',
          'zh-hant': '我加了 Test action，但 build 沒跑測試，為什麼？',
          ja: 'Test action を追加したのに build がテストを走らせない。なぜ？',
          ko: 'Test action을 추가했는데 build가 테스트를 실행하지 않는다. 왜?',
        },
        a: {
          en: 'A build that was already in flight when you added the action does not pick it up. Trigger a fresh build after saving the action. Also confirm the action selects your UITests scheme, not the app scheme whose Test Action may be an orphan reference.',
          'zh-hans': '加 action 时已在跑的旧 build 不会补跑。保存 action 后重新触发一次新 build。同时确认 action 选的是 UITests scheme，不是 app scheme（后者的 Test Action 可能是孤儿引用）。',
          'zh-hant': '加 action 時已在跑的舊 build 不會補跑。儲存 action 後重新觸發一次新 build。同時確認 action 選的是 UITests scheme，不是 app scheme（後者的 Test Action 可能是孤兒引用）。',
          ja: 'action 追加時に既に走っていた build には反映されない。action を保存した後に新しい build を再トリガーする。また、action が UITests scheme を選んでいることも確認する（app scheme の Test Action は孤児参照の可能性がある）。',
          ko: 'action 추가 시 이미 실행 중이던 build에는 반영되지 않는다. action 저장 후 새 build를 다시 트리거하라. 또한 action이 UITests scheme을 선택하고 있는지도 확인한다(app scheme의 Test Action은 고아 참조일 수 있다).',
        },
      },
      {
        q: {
          en: 'Does the Xcode Cloud Test action run my jest tests too?',
          'zh-hans': 'Xcode Cloud 的 Test action 也会跑我的 jest 测试吗？',
          'zh-hant': 'Xcode Cloud 的 Test action 也會跑我的 jest 測試嗎？',
          ja: 'Xcode Cloud の Test action は jest テストも走らせる？',
          ko: 'Xcode Cloud의 Test action이 jest 테스트도 실행하나?',
        },
        a: {
          en: 'No. The Test action runs only XCTest / XCUITest (the native layer). React Native JavaScript unit tests (jest) need a separate job — for example a jest job in GitLab CI running in parallel.',
          'zh-hans': '不会。Test action 只跑 XCTest / XCUITest（原生层）。RN 的 JavaScript 单测（jest）要单独配——比如用 GitLab CI 的 jest job 并行跑。',
          'zh-hant': '不會。Test action 只跑 XCTest / XCUITest（原生層）。RN 的 JavaScript 單測（jest）要單獨配——比如用 GitLab CI 的 jest job 並行跑。',
          ja: '走らない。Test action は XCTest / XCUITest（ネイティブ層）のみを実行する。RN の JavaScript 単体テスト（jest）は別途設定が必要——例えば GitLab CI の jest job を並行で走らせる。',
          ko: '아니요. Test action은 XCTest / XCUITest(네이티브 계층)만 실행한다. RN의 JavaScript 단위 테스트(jest)는 별도 설정이 필요——예를 들어 GitLab CI의 jest job을 병렬로 실행.',
        },
      },
    ],
  },
  {
    slug: 'gitlab-ci-rn-ios-pipeline',
    keywords: {
      en: 'GitLab CI, React Native iOS, iOS pipeline, fastlane, code signing, CI/CD, iOS build automation, self-hosted runner',
      'zh-hans': 'GitLab CI, React Native iOS, iOS 流水线, fastlane, 代码签名, CI/CD, 自动化构建, 自托管 runner',
      'zh-hant': 'GitLab CI, React Native iOS, iOS 管線, fastlane, 程式碼簽章, CI/CD, 自動化建置, 自托管 runner',
      ja: 'GitLab CI, React Native iOS, iOS パイプライン, fastlane, コード署名, CI/CD, 自動化, セルフホステッド runner',
      ko: 'GitLab CI, React Native iOS, iOS 파이프라인, fastlane, 코드 서명, CI/CD, 자동화 빌드, 셀프호스티드 runner',
    },
    category: 'GitLab CI',
    readTime: '10 min',
    publishedAt: '2026-08-04',
    dateModified: '2026-08-04',
    title: {
      en: 'GitLab CI for React Native iOS: a match + gym + Firebase pipeline',
      'zh-hans': 'GitLab CI 给 React Native 出 iOS 包：签名、构建、分发与 5 个连环坑',
      'zh-hant': 'GitLab CI 為 React Native 出 iOS 包：簽名、構建、分發與 5 個連環坑',
      ja: 'GitLab CI で React Native の iOS パッケージをビルド：署名・ビルド・配信と 5 つの連鎖罠',
      ko: 'GitLab CI로 React Native iOS 패키지 빌드: 서명·빌드·배포와 5개의 연쇄 함정',
    },
    description: {
      en: 'A verified GitLab CI pipeline that ships a React Native IPA to Firebase App Distribution — four stages, fastlane match signing, gym build, and the five real-world traps (cert quota burn, signing disabled, codegen artifacts, pod sync, bundler path) that each cost an hour.',
      'zh-hans': '一条已验证的 GitLab CI 链路：push beta → 四 stage pipeline（validate/prepare/build/notify）→ IPA → Firebase 分发。用 fastlane match 签名、gym 构建。以及真实跑通撞的 5 个连环坑（cert 名额撑爆 / 签名禁用 / codegen 产物 / Pod 同步 / bundler 路径），每个坑一两小时。',
      'zh-hant': '一條已驗證的 GitLab CI 鏈路：push beta → 四 stage pipeline（validate/prepare/build/notify）→ IPA → Firebase 分發。用 fastlane match 簽名、gym 構建。以及真實跑通撞的 5 個連環坑（cert 名額撐爆 / 簽名禁用 / codegen 產物 / Pod 同步 / bundler 路徑），每個坑一兩小時。',
      ja: '検証済みの GitLab CI パイプライン：beta に push → 4 stage（validate/prepare/build/notify）→ IPA → Firebase 配信。fastlane match で署名、gym でビルド。さらに実運用で踏んだ 5 つの連鎖罠（cert 名額枯渇 / 署名無効 / codegen 産物 / Pod 同期 / bundler パス）、各 1〜2 時間かかった落とし穴。',
      ko: '검증된 GitLab CI 파이프라인: beta에 push → 4단계(validate/prepare/build/notify) → IPA → Firebase 배포. fastlane match로 서명, gym으로 빌드. 그리고 실제로 겪은 5개 연쇄 함정(cert 할당량 고갈/서명 비활성/codegen 산물/Pod 동기화/bundler 경로), 각각 1~2시간 소요.',
    },
    body: {
      en: bodyFor('gitlab-ci-rn-ios-pipeline', 'en'),
      'zh-hans': bodyFor('gitlab-ci-rn-ios-pipeline', 'zh-hans'),
      'zh-hant': bodyFor('gitlab-ci-rn-ios-pipeline', 'zh-hant'),
      ja: bodyFor('gitlab-ci-rn-ios-pipeline', 'ja'),
      ko: bodyFor('gitlab-ci-rn-ios-pipeline', 'ko'),
    },
    howto: {
      tool: {
        en: 'GitLab CI with a SaaS macOS runner, fastlane (match + gym), and firebase-tools.',
        'zh-hans': 'GitLab CI（SaaS macOS runner）+ fastlane（match + gym）+ firebase-tools。',
        'zh-hant': 'GitLab CI（SaaS macOS runner）+ fastlane（match + gym）+ firebase-tools。',
        ja: 'GitLab CI（SaaS macOS runner）+ fastlane（match + gym）+ firebase-tools。',
        ko: 'GitLab CI(SaaS macOS runner) + fastlane(match + gym) + firebase-tools.',
      },
      steps: [
        {
          name: {
            en: 'Lay out four stages and branch rules',
            'zh-hans': '排四个 stage + 分支规则',
            'zh-hant': '排四個 stage + 分支規則',
            ja: '4 つの stage とブランチルールを組む',
            ko: '4개 stage와 브랜치 규칙 구성',
          },
          text: {
            en: 'validate (dry-run, also on master) → prepare (deps + pods) → build (gym) → notify (on a Linux runner). Use workflow.rules to send master to validate-only and beta to the full pipeline.',
            'zh-hans': 'validate（dry-run，master 也跑）→ prepare（依赖 + pods）→ build（gym）→ notify（放 Linux runner）。用 workflow.rules 让 master 只跑 validate、beta 跑全量。',
            'zh-hant': 'validate（dry-run，master 也跑）→ prepare（依賴 + pods）→ build（gym）→ notify（放 Linux runner）。用 workflow.rules 讓 master 只跑 validate、beta 跑全量。',
            ja: 'validate（dry-run、master でも実行）→ prepare（依存 + pods）→ build（gym）→ notify（Linux runner で）。workflow.rules で master は validate のみ、beta はフルパイプライン。',
            ko: 'validate(dry-run, master에서도 실행) → prepare(의존성 + pods) → build(gym) → notify(Linux runner에서). workflow.rules로 master는 validate만, beta는 전체 파이프라인.',
          },
        },
        {
          name: {
            en: 'Sign with fastlane match + an ASC API key',
            'zh-hans': '用 fastlane match + ASC API key 签名',
            'zh-hant': '用 fastlane match + ASC API key 簽名',
            ja: 'fastlane match + ASC API key で署名',
            ko: 'fastlane match + ASC API key로 서명',
          },
          text: {
            en: 'Store encrypted certs in a private git repo; CI runs match with readonly: true. Authenticate with an App Store Connect API key so the non-interactive shell skips Apple ID and 2FA.',
            'zh-hans': '证书加密存私有 git 仓，CI 用 match readonly: true 只读拉取。用 App Store Connect API key 认证，非交互 shell 绕开 Apple ID 和 2FA。',
            'zh-hant': '憑證加密存私有 git 倉，CI 用 match readonly: true 只讀拉取。用 App Store Connect API key 認證，非互動 shell 繞開 Apple ID 和 2FA。',
            ja: '証明書は暗号化してプライベート git リポジトリに保存、CI は match を readonly: true で読み取る。App Store Connect API key で認証し、非対話シェルは Apple ID と 2FA を回避。',
            ko: '인증서는 암호화해 private git repo에 저장, CI는 match를 readonly: true로 읽는다. App Store Connect API key로 인증해 비대화형 셸이 Apple ID와 2FA를 우회.',
          },
        },
        {
          name: {
            en: 'Expect five real-world traps',
            'zh-hans': '预判 5 个真实连环坑',
            'zh-hant': '預判 5 個真實連環坑',
            ja: '5 つの現実の連鎖罠を想定する',
            ko: '5개의 현실 연쇄 함정을 예상하라',
          },
          text: {
            en: 'Group commit hooks reject match commits and burn Apple cert quota; RN codegen output must be passed as an artifact; build-job Pods cache desyncs from prepare; stripping that cache also drops .bundle/config. Each fix is one line once diagnosed.',
            'zh-hans': 'group 的 commit hook 会拒 match 的 commit、撑爆 Apple cert 名额；RN codegen 产物必须作为 artifact 传递；build job 自己 cache 的 Pods 和 prepare 不同步；去掉那个 cache 又连带丢 .bundle/config。诊断清楚后每个修都是一行。',
            'zh-hant': 'group 的 commit hook 會拒 match 的 commit、撐爆 Apple cert 名額；RN codegen 產物必須作為 artifact 傳遞；build job 自己 cache 的 Pods 和 prepare 不同步；去掉那個 cache 又連帶丟 .bundle/config。診斷清楚後每個修都是一行。',
            ja: 'group の commit hook が match の commit を弾き、Apple cert 名額を枯渇させる；RN codegen 産物は artifact として渡す必要がある；build job 自身の Pods cache が prepare と非同期になる；その cache を外すと .bundle/config も消える。診断できれば各修正は 1 行。',
            ko: 'group의 commit hook이 match의 commit을 거부해 Apple cert 할당량을 고갈시킨다; RN codegen 산물은 artifact로 전달해야 한다; build job 자체 Pods cache가 prepare와 비동기가 된다; 해당 cache를 빼면 .bundle/config도 함께 사라진다. 진단만 되면 각 수정은 한 줄.',
          },
        },
        {
          name: {
            en: 'Distribute via firebase-tools, not the fastlane plugin',
            'zh-hans': '用 firebase-tools 分发，别用 fastlane 插件',
            'zh-hant': '用 firebase-tools 分發，別用 fastlane 插件',
            ja: 'fastlane プラグインではなく firebase-tools で配信',
            ko: 'fastlane 플러그인 말고 firebase-tools로 배포',
          },
          text: {
            en: 'The fastlane firebase_app_distribution plugin hits a staged-rollout error (HALTED release must have fraction). Use the firebase-tools CLI, which calls batchAddRelease and sidesteps rollout entirely.',
            'zh-hans': 'fastlane 的 firebase_app_distribution 插件会撞 staged rollout 报错（HALTED release must have fraction）。改用 firebase-tools CLI，它走 batchAddRelease，完全绕开 rollout。',
            'zh-hant': 'fastlane 的 firebase_app_distribution 插件會撞 staged rollout 報錯（HALTED release must have fraction）。改用 firebase-tools CLI，它走 batchAddRelease，完全繞開 rollout。',
            ja: 'fastlane の firebase_app_distribution プラグインは staged rollout エラー（HALTED release must have fraction）に当たる。firebase-tools CLI は batchAddRelease を呼び、rollout を完全に回避する。',
            ko: 'fastlane의 firebase_app_distribution 플러그인은 staged rollout 에러(HALTED release must have fraction)에 부딪힌다. firebase-tools CLI는 batchAddRelease를 호출해 rollout을 완전히 우회한다.',
          },
        },
      ],
    },
    faq: [
      {
        q: {
          en: 'Why does fastlane match keep rebuilding certs until Apple quota is exhausted?',
          'zh-hans': '为什么 fastlane match 一直重建证书，直到撑爆 Apple 名额？',
          'zh-hant': '為什麼 fastlane match 一直重建憑證，直到撐爆 Apple 名額？',
          ja: 'fastlane match が Apple の名額が枯渇するまで証明書を立て続けに作るのはなぜ？',
          ko: 'fastlane match가 Apple 할당량이 고갈될 때까지 인증서를 계속 만드는 이유는?',
        },
        a: {
          en: 'A group-level commit-message hook rejects match default commit, so certs never persist; the ephemeral runner rebuilds them next run. Seed certs locally into a hook-free bare repo, then run match readonly: true in CI to never push back.',
          'zh-hans': 'group 级的 commit-message hook 拒了 match 的默认 commit，证书存不下来；ephemeral runner 下次又重建。本地先 seed 到无 hook 的 bare 仓，CI 里 match readonly: true 永不回写。',
          'zh-hant': 'group 級的 commit-message hook 拒了 match 的預設 commit，憑證存不下來；ephemeral runner 下次又重建。本地先 seed 到無 hook 的 bare 倉，CI 裡 match readonly: true 永不回寫。',
          ja: 'group レベルの commit-message hook が match のデフォルト commit を弾き、証明書が永続化されない；ephemeral runner が次回また作る。ローカルで hook 無しの bare リポジトリに seed し、CI では match readonly: true で書き戻さない。',
          ko: 'group 수준의 commit-message hook이 match의 기본 commit을 거부해 인증서가 영속되지 않는다; ephemeral runner가 다음 실행에 다시 만든다. 로컬에서 hook 없는 bare repo에 seed하고, CI에서는 match readonly: true로 쓰기를 막는다.',
        },
      },
      {
        q: {
          en: 'Why does gym fail with "Automatic signing is disabled" in CI?',
          'zh-hans': '为什么 CI 里 gym 报 "Automatic signing is disabled"？',
          'zh-hant': '為什麼 CI 裡 gym 報 "Automatic signing is disabled"？',
          ja: 'CI で gym が "Automatic signing is disabled" で失敗するのはなぜ？',
          ko: 'CI에서 gym이 "Automatic signing is disabled"로 실패하는 이유는?',
        },
        a: {
          en: 'The React Native template leaves CODE_SIGN_IDENTITY as a placeholder and CODE_SIGN_STYLE unset, and CI has no Apple ID. Pass the ASC API key triplet via gym xcargs (-authenticationKeyPath/ID/Issuer) so xcodebuild does automatic signing without an Apple ID.',
          'zh-hans': 'RN 模板的 CODE_SIGN_IDENTITY 是占位、CODE_SIGN_STYLE 没设，CI 又没 Apple ID。通过 gym xcargs 传 ASC API key 三元组（-authenticationKeyPath/ID/Issuer），让 xcodebuild 无 Apple ID 也能 automatic signing。',
          'zh-hant': 'RN 模板的 CODE_SIGN_IDENTITY 是佔位、CODE_SIGN_STYLE 沒設，CI 又沒 Apple ID。透過 gym xcargs 傳 ASC API key 三元組（-authenticationKeyPath/ID/Issuer），讓 xcodebuild 無 Apple ID 也能 automatic signing。',
          ja: 'RN テンプレートは CODE_SIGN_IDENTITY がプレースホルダで CODE_SIGN_STYLE 未設定、CI にも Apple ID がない。gym xcargs で ASC API key 三つ組（-authenticationKeyPath/ID/Issuer）を渡し、Apple ID 無しで automatic signing させる。',
          ko: 'RN 템플릿은 CODE_SIGN_IDENTITY가 자리표시자이고 CODE_SIGN_STYLE 미설정, CI에도 Apple ID가 없다. gym xcargs로 ASC API key 세 쌍(-authenticationKeyPath/ID/Issuer)을 전달해 Apple ID 없이 automatic signing시킨다.',
        },
      },
      {
        q: {
          en: 'Why "sandbox is not in sync with Podfile.lock" in the build job?',
          'zh-hans': 'build job 为什么报 "sandbox is not in sync with Podfile.lock"？',
          'zh-hant': 'build job 為什麼報 "sandbox is not in sync with Podfile.lock"？',
          ja: 'build job で "sandbox is not in sync with Podfile.lock" になるのはなぜ？',
          ko: 'build job에서 "sandbox is not in sync with Podfile.lock"가 뜨는 이유는?',
        },
        a: {
          en: 'The build job cached an older Pods/ while prepare shipped a fresh one. Remove Pods/node_modules from the build cache (let prepare artifacts own them) and add ios/Podfile.lock to prepare artifacts.',
          'zh-hans': 'build job cache 了旧的 Pods/，而 prepare 带的是新的。去掉 build job 的 Pods/node_modules cache（交给 prepare artifacts），并给 prepare artifacts 加 ios/Podfile.lock。',
          'zh-hant': 'build job cache 了舊的 Pods/，而 prepare 帶的是新的。去掉 build job 的 Pods/node_modules cache（交給 prepare artifacts），並給 prepare artifacts 加 ios/Podfile.lock。',
          ja: 'build job が古い Pods/ を cache し、prepare が新しいものを出荷した。build job の Pods/node_modules cache を外し（prepare artifacts に任せる）、prepare artifacts に ios/Podfile.lock を追加する。',
          ko: 'build job이 옛 Pods/를 cache하고 prepare는 새 것을 보냈다. build job의 Pods/node_modules cache를 빼고(prepare artifacts에 맡기고), prepare artifacts에 ios/Podfile.lock을 추가한다.',
        },
      },
      {
        q: {
          en: 'Firebase distribution fails with "HALTED release must have fraction" — why?',
          'zh-hans': 'Firebase 分发报 "HALTED release must have fraction"，为什么？',
          'zh-hant': 'Firebase 分發報 "HALTED release must have fraction"，為什麼？',
          ja: 'Firebase 配信が "HALTED release must have fraction" で失敗するのはなぜ？',
          ko: 'Firebase 배포가 "HALTED release must have fraction"으로 실패하는 이유는?',
        },
        a: {
          en: 'The fastlane firebase_app_distribution plugin calls a staged-rollout API that requires a fraction field it does not send. Switch to the firebase-tools CLI (npx firebase-tools appdistribution:distribute), which adds the build to the tester group directly.',
          'zh-hans': 'fastlane 的 firebase_app_distribution 插件调的 staged-rollout API 需要 fraction 字段，但插件没发。换 firebase-tools CLI（npx firebase-tools appdistribution:distribute），它直接把 build 加进测试组。',
          'zh-hant': 'fastlane 的 firebase_app_distribution 插件呼叫的 staged-rollout API 需要 fraction 欄位，但插件沒發。換 firebase-tools CLI（npx firebase-tools appdistribution:distribute），它直接把 build 加進測試組。',
          ja: 'fastlane の firebase_app_distribution プラグインが呼ぶ staged-rollout API は fraction フィールドを要求するが、プラグインは送らない。firebase-tools CLI（npx firebase-tools appdistribution:distribute）に切り替えると、build を直接テスター group に追加する。',
          ko: 'fastlane의 firebase_app_distribution 플러그인이 호출하는 staged-rollout API는 fraction 필드를 요구하지만 플러그인은 보내지 않는다. firebase-tools CLI(npx firebase-tools appdistribution:distribute)로 전환하면 build를 직접 테스터 group에 추가한다.',
        },
      },
    ],
  },
  {
    slug: 'rn-ios-dual-ci-architecture',
    keywords: {
      en: 'Xcode Cloud, GitLab CI, dual CI, React Native iOS, CI/CD architecture, Firebase App Distribution, branch strategy, iOS release pipeline',
      'zh-hans': 'Xcode Cloud, GitLab CI, 双 CI, React Native iOS, CI/CD 架构, Firebase App Distribution, 分支策略, iOS 发版流水线',
      'zh-hant': 'Xcode Cloud, GitLab CI, 雙 CI, React Native iOS, CI/CD 架構, Firebase App Distribution, 分支策略, iOS 發版管線',
      ja: 'Xcode Cloud, GitLab CI, デュアル CI, React Native iOS, CI/CD アーキテクチャ, Firebase App Distribution, ブランチ戦略, iOS リリースパイプライン',
      ko: 'Xcode Cloud, GitLab CI, 듀얼 CI, React Native iOS, CI/CD 아키텍처, Firebase App Distribution, 브랜치 전략, iOS 릴리스 파이프라인',
    },
    category: 'Architecture',
    readTime: '6 min',
    publishedAt: '2026-08-04',
    dateModified: '2026-08-04',
    title: {
      en: 'React Native iOS build architecture: why run Xcode Cloud + GitLab CI in parallel',
      'zh-hans': 'React Native iOS 出包架构：Xcode Cloud + GitLab CI 双线路，为什么这么选',
      'zh-hant': 'React Native iOS 出包架構：Xcode Cloud + GitLab CI 雙線路，為什麼這麼選',
      ja: 'React Native iOS ビルドアーキテクチャ：Xcode Cloud + GitLab CI の二重化をなぜ選ぶか',
      ko: 'React Native iOS 빌드 아키텍처: Xcode Cloud + GitLab CI 이중 라인을 왜 택했나',
    },
    description: {
      en: 'A field-tested iOS release architecture for solo founders and small teams: Xcode Cloud and GitLab CI as parallel branch-routed pipelines, both shipping to Firebase App Distribution, with Lark notifications. Cloud builds, zero local Mac, automated signing, one-tap tester install.',
      'zh-hans': '一套实战跑通的 iOS 出包架构：Xcode Cloud + GitLab CI 双 CI 线路按分支分流，都发到 Firebase App Distribution，Lark 闭环通知。云端出包、零本地 Mac、签名全自动、测试者一键装机。讲清楚为什么这么选，以及取舍。',
      'zh-hant': '一套實戰跑通的 iOS 出包架構：Xcode Cloud + GitLab CI 雙 CI 線路按分支分流，都發到 Firebase App Distribution，Lark 閉環通知。雲端出包、零本地 Mac、簽名全自動、測試者一鍵裝機。講清楚為什麼這麼選，以及取捨。',
      ja: '実戦で検証した iOS リリースアーキテクチャ：Xcode Cloud + GitLab CI の二重 CI をブランチで分岐させ、両方を Firebase App Distribution に配信、Lark で通知。クラウドビルド、ローカル Mac 不要、署名フル自動、テスターのワンタップ install。なぜこの選択かとトレードオフを整理。',
      ko: '실전 검증된 iOS 출하 아키텍처: Xcode Cloud + GitLab CI 이중 CI 라인을 브랜치로 분기하고, 두 라인 모두 Firebase App Distribution으로 배송, Lark로 알림. 클라우드 빌드, 로컬 Mac 불필요, 서명 완전 자동, 테스터 원탭 설치. 왜 이 선택인지와 트레이드오프 정리.',
    },
    body: {
      en: bodyFor('rn-ios-dual-ci-architecture', 'en'),
      'zh-hans': bodyFor('rn-ios-dual-ci-architecture', 'zh-hans'),
      'zh-hant': bodyFor('rn-ios-dual-ci-architecture', 'zh-hant'),
      ja: bodyFor('rn-ios-dual-ci-architecture', 'ja'),
      ko: bodyFor('rn-ios-dual-ci-architecture', 'ko'),
    },
    howto: {
      tool: {
        en: 'Xcode Cloud, GitLab CI with a SaaS macOS runner, Firebase App Distribution, and a Lark/webhook endpoint.',
        'zh-hans': 'Xcode Cloud、GitLab CI（SaaS macOS runner）、Firebase App Distribution、Lark/webhook 端点。',
        'zh-hant': 'Xcode Cloud、GitLab CI（SaaS macOS runner）、Firebase App Distribution、Lark/webhook 端點。',
        ja: 'Xcode Cloud、GitLab CI（SaaS macOS runner）、Firebase App Distribution、Lark/webhook エンドポイント。',
        ko: 'Xcode Cloud, GitLab CI(SaaS macOS runner), Firebase App Distribution, Lark/webhook 엔드포인트.',
      },
      steps: [
        {
          name: {
            en: 'Route CI by branch',
            'zh-hans': '按分支分流 CI',
            'zh-hant': '按分支分流 CI',
            ja: 'ブランチで CI を分岐',
            ko: '브랜치로 CI 분기',
          },
          text: {
            en: 'Point Xcode Cloud at master and GitLab CI at beta. workflow.rules in .gitlab-ci.yml gates which branch runs the full pipeline, so the two never collide.',
            'zh-hans': 'Xcode Cloud 监 master、GitLab CI 监 beta。.gitlab-ci.yml 的 workflow.rules 控制哪个分支跑全量 pipeline，两条线互不干扰。',
            'zh-hant': 'Xcode Cloud 監 master、GitLab CI 監 beta。.gitlab-ci.yml 的 workflow.rules 控制哪個分支跑全量 pipeline，兩條線互不干擾。',
            ja: 'Xcode Cloud を master、GitLab CI を beta に向ける。.gitlab-ci.yml の workflow.rules でどのブランチがフルパイプラインを走るか制御し、2 線は衝突しない。',
            ko: 'Xcode Cloud는 master, GitLab CI는 beta에 연결. .gitlab-ci.yml의 workflow.rules로 어느 브랜치가 전체 파이프라인을 실행할지 제어해 두 라인이 충돌하지 않게 한다.',
          },
        },
        {
          name: {
            en: 'Automate signing two ways',
            'zh-hans': '两种方式自动化签名',
            'zh-hant': '兩種方式自動化簽名',
            ja: '2 つの方法で署名を自動化',
            ko: '두 가지 방식으로 서명 자동화',
          },
          text: {
            en: 'On Xcode Cloud, rely on the internal signing proxy (no cert config). On GitLab CI, use fastlane match with an App Store Connect API key so the non-interactive shell skips Apple ID and 2FA.',
            'zh-hans': 'Xcode Cloud 靠内部签名代理（免配证书）；GitLab CI 用 fastlane match + App Store Connect API key，非交互 shell 绕开 Apple ID 和 2FA。',
            'zh-hant': 'Xcode Cloud 靠內部簽名代理（免配憑證）；GitLab CI 用 fastlane match + App Store Connect API key，非互動 shell 繞開 Apple ID 和 2FA。',
            ja: 'Xcode Cloud は内部署名プロキシに頼り（証明書設定不要）、GitLab CI は fastlane match + App Store Connect API key で非対話シェルが Apple ID と 2FA を回避。',
            ko: 'Xcode Cloud는 내부 서명 프록시에 의존(인증서 설정 불필요), GitLab CI는 fastlane match + App Store Connect API key로 비대화형 셸이 Apple ID와 2FA를 우회.',
          },
        },
        {
          name: {
            en: 'Ship both pipelines to one Firebase project',
            'zh-hans': '两条线路都发到同一个 Firebase',
            'zh-hant': '兩條線路都發到同一個 Firebase',
            ja: '両パイプラインを 1 つの Firebase に配信',
            ko: '두 라인 모두 한 Firebase로 배송',
          },
          text: {
            en: 'Use firebase-tools CLI in both ci_post_xcodebuild.sh and the GitLab build job. One Firebase project, one tester group, one install link per build — no TestFlight review.',
            'zh-hans': 'ci_post_xcodebuild.sh 和 GitLab build job 都用 firebase-tools CLI。一个 Firebase 项目、一个测试组、每个 build 一个装机链接——不走 TestFlight 审核。',
            'zh-hant': 'ci_post_xcodebuild.sh 和 GitLab build job 都用 firebase-tools CLI。一個 Firebase 專案、一個測試組、每個 build 一個裝機連結——不走 TestFlight 審核。',
            ja: 'ci_post_xcodebuild.sh と GitLab build job の両方で firebase-tools CLI を使う。1 つの Firebase、1 つのテスター group、build ごとに 1 つの install リンク——TestFlight 審査なし。',
            ko: 'ci_post_xcodebuild.sh와 GitLab build job 모두에서 firebase-tools CLI 사용. 하나의 Firebase, 하나의 테스터 group, 빌드마다 하나의 설치 링크——TestFlight 심사 없음.',
          },
        },
        {
          name: {
            en: 'Close the loop with Lark notifications',
            'zh-hans': 'Lark 通知闭环',
            'zh-hant': 'Lark 通知閉環',
            ja: 'Lark 通知でループを閉じる',
            ko: 'Lark 알림으로 루프를 닫는다',
          },
          text: {
            en: 'Add a notify stage on a cheap Linux runner that posts build status + branch + version to a Lark/webhook group. You stop polling the CI dashboard.',
            'zh-hans': '加一个 notify stage（放便宜的 Linux runner），把 build 状态 + 分支 + 版本推到 Lark/webhook 群。你不再盯着 CI 面板轮询。',
            'zh-hant': '加一個 notify stage（放便宜的 Linux runner），把 build 狀態 + 分支 + 版本推到 Lark/webhook 群。你不再盯著 CI 面板輪詢。',
            ja: '安価な Linux runner で notify stage を追加し、build 状態 + ブランチ + バージョンを Lark/webhook group に投稿。CI ダッシュボードのポーリングから解放される。',
            ko: '저렴한 Linux runner에서 notify stage를 추가해 build 상태 + 브랜치 + 버전을 Lark/webhook 그룹에 게시. CI 대시보드 폴링에서 해방된다.',
          },
        },
      ],
    },
    faq: [
      {
        q: {
          en: 'Why run two CIs instead of one?',
          'zh-hans': '为什么用两套 CI 而不是一套？',
          'zh-hant': '為什麼用兩套 CI 而不是一套？',
          ja: 'なぜ 1 つではなく 2 つの CI を走らせる？',
          ko: '왜 하나가 아니라 두 개의 CI를?',
        },
        a: {
          en: 'Redundancy and complementarity. Xcode Cloud gives you zero-config Apple signing; GitLab CI gives you flexible, self-hostable pipelines. Branch-routing them means one outage does not block a release, and you get both signing paradigms.',
          'zh-hans': '冗余 + 互补。Xcode Cloud 给你零配置的苹果签名，GitLab CI 给你灵活、可自托管的 pipeline。按分支分流，一套故障不阻断发版，你还同时掌握两种签名范式。',
          'zh-hant': '冗餘 + 互補。Xcode Cloud 給你零配置的蘋果簽名，GitLab CI 給你靈活、可自託管的 pipeline。按分支分流，一套故障不阻斷發版，你還同時掌握兩種簽名範式。',
          ja: '冗長と補完。Xcode Cloud はゼロ設定の Apple 署名、GitLab CI は柔軟で自己ホスト可能なパイプライン。ブランチ分岐で一方の障害がリリースをブロックせず、2 つの署名パラダイムを両方習得できる。',
          ko: '중복과 보완. Xcode Cloud는 제로 설정 Apple 서명, GitLab CI는 유연하고 자체 호스팅 가능한 파이프라인. 브랜치 분기로 한쪽 장애가 릴리스를 막지 않고, 두 서명 패러다임을 모두 익힌다.',
        },
      },
      {
        q: {
          en: 'Firebase App Distribution or TestFlight?',
          'zh-hans': 'Firebase App Distribution 还是 TestFlight？',
          'zh-hant': 'Firebase App Distribution 還是 TestFlight？',
          ja: 'Firebase App Distribution か TestFlight か？',
          ko: 'Firebase App Distribution인가 TestFlight인가?',
        },
        a: {
          en: 'Firebase for speed, TestFlight for scale. Firebase gives an instant install link per build with no review — ideal for early demos and small tester groups. TestFlight is better once you need hundreds of testers or an App Store-bound beta.',
          'zh-hans': 'Firebase 求快，TestFlight 求规模。Firebase 每个 build 给即时装机链接、无审核——适合早期 demo 和小测试组。TestFlight 适合要扩到几百测试者或冲 App Store 的 beta。',
          'zh-hant': 'Firebase 求快，TestFlight 求規模。Firebase 每個 build 給即時裝機連結、無審核——適合早期 demo 和小測試組。TestFlight 適合要擴到幾百測試者或衝 App Store 的 beta。',
          ja: 'Firebase は速さ、TestFlight は規模。Firebase は build ごとに即時 install リンクで審査なし——早期デモや小規模テスターに最適。TestFlight は数百のテスターや App Store 向け beta に向く。',
          ko: 'Firebase는 속도, TestFlight는 규모. Firebase는 빌드마다 즉시 설치 링크에 심사 없음——초기 데모와 소규모 테스터에 최적. TestFlight는 수백 테스터나 App Store행 beta에 적합.',
        },
      },
      {
        q: {
          en: 'How do the two CIs not collide?',
          'zh-hans': '两套 CI 怎么不打架？',
          'zh-hant': '兩套 CI 怎麼不打架？',
          ja: '2 つの CI はどう衝突を避ける？',
          ko: '두 CI가 어떻게 충돌을 피하나?',
        },
        a: {
          en: 'Branch routing. Xcode Cloud watches master; GitLab CI workflow.rules runs the full pipeline only on beta. A push to master triggers one, a push to beta triggers the other — they never both fire on the same commit.',
          'zh-hans': '分支分流。Xcode Cloud 监 master；GitLab CI 的 workflow.rules 只在 beta 跑全量。push master 触发一套，push beta 触发另一套——不会对同一个 commit 两套都跑。',
          'zh-hant': '分支分流。Xcode Cloud 監 master；GitLab CI 的 workflow.rules 只在 beta 跑全量。push master 觸發一套，push beta 觸發另一套——不會對同一個 commit 兩套都跑。',
          ja: 'ブランチ分岐。Xcode Cloud は master、GitLab CI の workflow.rules は beta のみフル実行。master への push が一方、beta への push が他方を発火し、同じ commit で両方は走らない。',
          ko: '브랜치 분기. Xcode Cloud는 master, GitLab CI의 workflow.rules는 beta에서만 전체 실행. master push는 한쪽, beta push는 다른 쪽을 발화하고, 같은 commit에서 둘 다 실행되지 않는다.',
        },
      },
      {
        q: {
          en: 'What does this architecture cost?',
          'zh-hans': '这套架构要多少钱？',
          'zh-hant': '這套架構要多少錢？',
          ja: 'このアーキテクチャのコストは？',
          ko: '이 아키텍처 비용은?',
        },
        a: {
          en: 'Xcode Cloud bills by the minute with a free monthly allotment and only fires on master. GitLab SaaS macOS runners need a Premium tier and only fire the full pipeline on beta. With caching, a repeat GitLab build drops from ~14 min to ~4 min. For a solo founder it is single-digit dollars per release.',
          'zh-hans': 'Xcode Cloud 按月分钟计费（有免费额度），只在 master 触发。GitLab SaaS macOS runner 要 Premium 档，只在 beta 跑全量。配合 cache，GitLab 二次构建从约 14 分钟降到约 4 分钟。对一人公司，每次发版个位数美元。',
          'zh-hant': 'Xcode Cloud 按月分鐘計費（有免費額度），只在 master 觸發。GitLab SaaS macOS runner 要 Premium 檔，只在 beta 跑全量。配合 cache，GitLab 二次構建從約 14 分鐘降到約 4 分鐘。對一人公司，每次發版個位數美元。',
          ja: 'Xcode Cloud は分単位（月間無料枠あり）、master でのみ発火。GitLab SaaS macOS runner は Premium 必要、beta でのみフル実行。cache で GitLab の 2 回目は約 14 分から約 4 分へ。一人会社なら 1 リリース 1 桁ドル。',
          ko: 'Xcode Cloud는 분당 과금(월간 무료 한도 있음), master에서만 발화. GitLab SaaS macOS runner는 Premium 필요, beta에서만 전체 실행. cache로 GitLab 두 번째 빌드가 약 14분에서 약 4분으로. 1인 회사 기준 릴리스당 한 자리수 달러.',
        },
      },
    ],
  },
];
