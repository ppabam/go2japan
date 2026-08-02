import { useCallback, useEffect, useState } from 'react';
import { getInstallMode } from '../lib/install';

// beforeinstallprompt 는 페이지 로드 직후 한 번 발생하고 끝난다.
// React 가 마운트되기 전에 지나가버릴 수 있어서 index.html 의 인라인 스크립트가
// 이벤트를 붙잡아 window.__go2japanInstallPrompt 에 담아둔다.
const PROMPT_READY_EVENT = 'go2japan:installprompt';

const isStandaloneDisplay = () =>
  window.matchMedia?.('(display-mode: standalone)').matches === true ||
  // iOS 사파리는 display-mode 대신 이 값을 쓴다
  window.navigator.standalone === true;

export function useInstallPrompt() {
  const [prompt, setPrompt] = useState(() => window.__go2japanInstallPrompt ?? null);
  const [installed, setInstalled] = useState(isStandaloneDisplay);

  useEffect(() => {
    const onPromptReady = () => setPrompt(window.__go2japanInstallPrompt ?? null);
    const onInstalled = () => {
      window.__go2japanInstallPrompt = null;
      setPrompt(null);
      setInstalled(true);
    };

    window.addEventListener(PROMPT_READY_EVENT, onPromptReady);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener(PROMPT_READY_EVENT, onPromptReady);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!prompt) return 'unavailable';
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    // 프롬프트는 한 번만 쓸 수 있다.
    window.__go2japanInstallPrompt = null;
    setPrompt(null);
    if (outcome === 'accepted') setInstalled(true);
    return outcome;
  }, [prompt]);

  const mode = getInstallMode({
    userAgent: window.navigator.userAgent,
    maxTouchPoints: window.navigator.maxTouchPoints ?? 0,
    isNativeApp: window.__GO2JAPAN_NATIVE__ === true,
    isStandalone: installed,
    hasPrompt: Boolean(prompt),
  });

  return { mode, install };
}
