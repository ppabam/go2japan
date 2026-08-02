# Go2Japan 네이티브 앱

웹앱을 WebView 로 감싼 안드로이드/iOS 앱입니다. Expo + `react-native-webview`.

웹 빌드를 **파일 하나로 말아서 앱 안에 넣기 때문에** 네트워크 없이도 켜집니다.
서버를 부르지 않으므로 첫 화면이 즉시 뜹니다.

## 동작 방식

```
npm run build:app  (저장소 루트)
  └ vite build --mode singlefile   JS/CSS 를 전부 index.html 에 인라인 → dist-app/index.html
  └ app/scripts/sync-web.mjs       그 HTML 을 app/web/bundle.js 로 (JS 문자열)

app/App.js
  └ <WebView source={{ html, baseUrl: 'https://go2japan.vercel.app/' }} />
```

`baseUrl` 을 주는 이유: `localStorage` 는 출처(origin)에 묶입니다. HTML 만 실으면 출처가
`about:blank` 이 되어 앱을 껐다 켤 때마다 학습 기록이 날아갑니다. 에셋으로 번들해
`file://` 로 여는 방법도 안드로이드 WebView 가 `file://` 출처의 `localStorage` 를 막아
같은 문제가 생깁니다.

앱 안에서는 `window.__GO2JAPAN_NATIVE__` 를 주입해서, 웹앱 설정의 '앱으로 설치' 안내가
자동으로 감춰집니다.

## 개발

```bash
npm install                # app/ 에서
npm start                  # 웹 빌드 후 Expo 개발 서버 (Expo Go 로 스캔)
npm run doctor             # 설정 점검
```

`npm start` / `npm run android` 는 웹 빌드를 먼저 돌리므로 웹을 고쳤으면 그냥 다시 실행하면 됩니다.

## 안드로이드 APK 만들기

로컬에 Android SDK 가 없어도 됩니다. [EAS Build](https://docs.expo.dev/build/introduction/) 가
클라우드에서 빌드합니다.

```bash
npm install -g eas-cli
eas login                  # Expo 계정 필요 (무료)
eas build:configure
npm run apk                # preview 프로필 → 설치 가능한 APK
```

빌드가 끝나면 나오는 링크에서 APK 를 받아 폰에 넣으면 됩니다.
설치할 때 **'출처를 알 수 없는 앱' 허용**이 필요합니다.

Play 스토어에 올리려면 AAB 가 필요합니다.

```bash
npm run aab                # production 프로필 → app-bundle
```

## iOS

`app.json` 에 iOS 설정은 들어 있지만 이 저장소에서는 아직 빌드해보지 않았습니다.
실제로 아이폰에 넣으려면 넘어야 할 게 있습니다.

| 항목 | 내용 |
| --- | --- |
| 빌드 | EAS Build 가 클라우드 맥을 써주므로 Mac 은 없어도 됩니다 |
| 설치 | **Apple Developer Program $99/년** 이 필요합니다. 무료 개인 서명은 7일마다 재설치 + Mac 연결이라 실용성이 없습니다 |
| 심사 | **가이드라인 4.2 (Minimum Functionality)** — 웹사이트를 WebView 로 감싸기만 한 앱은 대표적인 반려 사유입니다 |

심사를 통과하려면 웹으로는 못 하는 걸 붙여야 합니다. 이 앱이라면
학습 리마인더 푸시 알림, 정답/오답 햅틱, 홈 화면 위젯 정도가 명분이 됩니다.
안드로이드는 이런 제약이 없어 APK 를 그대로 배포할 수 있습니다.

## EAS 빌드에서의 웹 번들

`app/web/bundle.js` 는 생성 파일이라 커밋하지 않습니다.
EAS 는 `package.json` 의 `eas-build-pre-install` 훅에서 저장소 루트의 웹 빌드를 먼저 돌립니다.

```json
"eas-build-pre-install": "cd .. && npm ci && npm run build:app"
```

EAS 는 git 저장소 루트를 통째로 올리므로 상위 디렉터리의 웹 프로젝트에 접근할 수 있습니다.
