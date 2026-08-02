// 설치 안내를 어떤 형태로 보여줄지 결정한다.
//
// 브라우저마다 사정이 다르다.
// - 안드로이드 크롬: beforeinstallprompt 이벤트를 받아 설치 프롬프트를 띄울 수 있다.
// - iOS 사파리: 그런 API 가 없다. '공유 -> 홈 화면에 추가' 를 직접 안내해야 한다.
// - 이미 설치된 PWA / 네이티브 앱 WebView: 설치할 게 없으니 안내를 감춘다.

export const INSTALL_MODES = {
  // 네이티브 앱 안에서 열림 -> 설치 섹션 자체를 숨긴다
  NATIVE: 'native',
  // 이미 홈 화면 앱으로 실행 중
  INSTALLED: 'installed',
  // 브라우저가 설치 프롬프트를 줬다
  PROMPT: 'prompt',
  // iOS 는 프롬프트가 없어 수동 안내
  IOS_MANUAL: 'ios-manual',
  // 설치를 지원하지 않는 브라우저
  UNSUPPORTED: 'unsupported',
};

export const ANDROID_APK_URL = 'https://github.com/ppabam/go2japan/releases/latest';

export function isIOS(userAgent = '', maxTouchPoints = 0) {
  if (/iPad|iPhone|iPod/.test(userAgent)) return true;
  // iPadOS 13 부터 사파리가 자신을 Macintosh 로 소개한다. 터치 지원 여부로 가른다.
  return /Macintosh/.test(userAgent) && maxTouchPoints > 1;
}

export function getInstallMode({
  userAgent = '',
  maxTouchPoints = 0,
  isNativeApp = false,
  isStandalone = false,
  hasPrompt = false,
} = {}) {
  if (isNativeApp) return INSTALL_MODES.NATIVE;
  if (isStandalone) return INSTALL_MODES.INSTALLED;
  if (hasPrompt) return INSTALL_MODES.PROMPT;
  if (isIOS(userAgent, maxTouchPoints)) return INSTALL_MODES.IOS_MANUAL;
  return INSTALL_MODES.UNSUPPORTED;
}
