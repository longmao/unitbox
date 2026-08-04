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
  const key = `./apple-dev-recipes/${slug}.${locale}.md`;
  const body = recipeBodies[key];
  if (!body) throw new Error(`Recipe body not found: ${key}`);
  return body;
}

export const appleDevArticles: AppleDevArticle[] = [
  {
    slug: 'xcode-cloud-rn-ipa-firebase',
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
];
