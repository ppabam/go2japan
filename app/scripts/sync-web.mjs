#!/usr/bin/env node
// 웹 빌드 산출물(dist-app/index.html)을 React Native 가 import 할 수 있는 모듈로 바꾼다.
//
// 왜 문자열로 넣는가:
// HTML 을 에셋으로 번들해 file:// 로 여는 방법도 있지만, 안드로이드 WebView 는
// file:// 출처에서 localStorage 를 막는다. 이 앱은 진행 상황을 전부 localStorage 에
// 넣으므로 그렇게 하면 앱을 껐다 켤 때마다 기록이 날아간다.
// source={{ html, baseUrl }} 로 실으면 baseUrl 출처의 저장소를 그대로 쓸 수 있다.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(appDir);
const source = join(repoRoot, 'dist-app', 'index.html');
const target = join(appDir, 'web', 'bundle.js');

let html;
try {
  html = readFileSync(source, 'utf8');
} catch {
  console.error(`웹 빌드를 찾지 못했습니다: ${source}`);
  console.error("저장소 루트에서 'npm run build:app' 을 먼저 실행하세요.");
  process.exit(1);
}

// 인라인되지 않고 남은 참조가 있으면 앱이 오프라인에서 빈 화면이 된다.
// 문자열 포함 검사는 번들된 JS 안의 src=" 같은 코드에 걸리므로 태그 단위로 본다.
const externalRefs = [
  ...html.matchAll(/<script\b[^>]*\bsrc=/gi),
  ...html.matchAll(/<link\b[^>]*\brel=["']?stylesheet/gi),
];

if (externalRefs.length > 0) {
  console.error(`외부 리소스 참조가 ${externalRefs.length}개 남아 있습니다.`);
  console.error("singlefile 모드로 빌드했는지 확인하세요 ('npm run build:app').");
  process.exit(1);
}

mkdirSync(dirname(target), { recursive: true });

// JSON.stringify 가 따옴표·개행·유니코드를 전부 안전하게 이스케이프해준다.
writeFileSync(
  target,
  [
    '// 자동 생성 파일입니다. 직접 고치지 마세요.',
    "// 저장소 루트에서 'npm run build:app' 을 실행하면 다시 만들어집니다.",
    `export default ${JSON.stringify(html)};`,
    '',
  ].join('\n'),
);

console.log(`app/web/bundle.js 생성 완료 (${(html.length / 1024).toFixed(1)} kB)`);
