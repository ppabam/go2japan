import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { viteSingleFile } from 'vite-plugin-singlefile'

// 빌드가 두 갈래다.
//
//   npm run build      웹 배포용. 서비스 워커와 매니페스트를 포함한 보통의 PWA 빌드.
//   npm run build:app  네이티브 앱용. JS/CSS 를 전부 index.html 안에 밀어넣어
//                      파일 하나로 만든다. 앱은 이 문자열을 WebView 에 그대로 실어
//                      네트워크 없이 띄운다. 서비스 워커는 WebView 에서 쓸모가 없다.
export default defineConfig(({ mode }) => {
  const singleFile = mode === 'singlefile'

  return {
    plugins: [
      react(),
      ...(singleFile
        ? [viteSingleFile()]
        : [
            VitePWA({
              registerType: 'autoUpdate',
              // public/ 에 실제로 있는 파일만 적는다. 없는 파일을 적으면 설치 시 404 가 난다.
              includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
              manifest: {
                name: 'Go2Japan - 일본어 정복',
                short_name: 'Go2Japan',
                description: '히라가나 가타카나 암기 앱',
                lang: 'ko',
                start_url: '/',
                scope: '/',
                display: 'standalone',
                orientation: 'portrait',
                categories: ['education'],
                // 앱은 다크 테마다. 흰색으로 두면 설치 시 상태바만 하얗게 뜬다.
                theme_color: '#1e272e',
                background_color: '#1e272e',
                icons: [
                  {
                    src: 'pwa-192x192.png',
                    sizes: '192x192',
                    type: 'image/png',
                    purpose: 'any'
                  },
                  {
                    src: 'pwa-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any'
                  },
                  {
                    src: 'pwa-maskable-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'maskable'
                  }
                ]
              }
            })
          ])
    ],
    build: singleFile ? { outDir: 'dist-app', chunkSizeWarningLimit: 4096 } : {}
  }
})
