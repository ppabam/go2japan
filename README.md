# Go2Japan 👹

히라가나·가타카나를 한국어 독음으로 맞추며 외우는 플래시카드 PWA입니다.
설치해서 오프라인으로 쓸 수 있고, 계정도 서버도 없이 브라우저에만 기록이 남습니다.

> 일본어 정복의 길은 멀고도 험하다...

## 기능

- **간격 반복 학습** — 틀리거나 "모르겠음"을 누른 글자는 가중치가 올라가 더 자주 나오고, 맞힌 글자는 점점 덜 나옵니다.
- **학습 범위 선택** — 히라가나 / 가타카나 / 전체, 그리고 탁음·반탁음·요음(が, ぱ, きゃ) 포함 여부를 고를 수 있습니다.
- **연속 학습일(스트릭)** — 하루라도 빠지면 끊깁니다. 이어갈 때마다 컨페티가 터집니다.
- **학습 리포트** — 정답률, 누적 문항, 오늘 푼 문제, 마스터한 글자 수, 제일 약한 글자 Top 5.
- **발음 듣기** — 브라우저 내장 TTS로 일본어 발음을 들려줍니다.
- **키보드 지원** — 보기 `1`~`3`, 모르겠음 `0`, 다음 `Space`, 발음 `S`.
- **PWA** — 홈 화면에 설치하면 오프라인에서도 동작합니다.

## 학습 문자

| 범위 | 히라가나 | 가타카나 |
| --- | --- | --- |
| 오십음도 | 46자 | 46자 |
| 탁음·반탁음 | 25자 | 25자 |
| 요음 | 33자 | 33자 |

가타카나는 유니코드 상 히라가나와 정확히 `0x60` 만큼 떨어져 있어서
(`あ` U+3042 → `ア` U+30A2), 읽기 정보는 히라가나 한 벌만 두고 파생시킵니다 — `src/data.js`.

## 실행

```bash
npm install
npm run dev        # 개발 서버
npm test           # 유닛 테스트
npm run lint       # oxlint
npm run build      # 프로덕션 빌드
npm run preview    # 빌드 결과 확인 (PWA 동작은 여기서 확인)
```

Node 20 이상이 필요합니다.

## 기술 스택

- [React 19](https://react.dev) — 라우터 없이 해시 기반 뷰 전환
- [Vite 8](https://vite.dev) + [vite-plugin-pwa](https://vite-pwa-org.netlify.app) — 빌드와 서비스 워커
- [Chart.js](https://www.chartjs.org) / react-chartjs-2 — 학습 통계
- [lucide-react](https://lucide.dev), [canvas-confetti](https://github.com/catdad/canvas-confetti)
- [Vitest](https://vitest.dev) — `src/lib` 순수 로직 테스트
- [oxlint](https://oxc.rs) — 린트

## 구조

```
src/
  App.jsx            뷰 전환 + 전역 상태와 저장
  data.js            문자표와 학습 범위 선택
  lib/
    storage.js       localStorage 안전 접근, 저장본 정규화·마이그레이션
    streak.js        연속 학습일 날짜 계산
    quiz.js          가중치 출제와 보기 생성
  components/
    Home.jsx  Practice.jsx  Stats.jsx  SettingsView.jsx
scripts/
  generate-icons.py  PWA 아이콘 생성 (디자인 변경 시에만 실행)
```

모든 진행 상황은 `localStorage`의 `go2japan-*` 키에 저장됩니다.
설정 화면의 **진행 상황 초기화**로 전부 지울 수 있습니다.

## 배포

[Vercel](https://vercel.com)에 정적 빌드로 올립니다. 별도 설정 없이 `npm run build` 결과인 `dist/`를 그대로 서빙하면 됩니다.

## 라이선스

[MIT](./LICENSE)
