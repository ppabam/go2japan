import { useState } from 'react';
import { Check, Download, Share, Smartphone } from 'lucide-react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { ANDROID_APK_URL, INSTALL_MODES } from '../lib/install';

export default function InstallSection() {
  const { mode, install } = useInstallPrompt();
  const [outcome, setOutcome] = useState(null);

  // 이미 네이티브 앱 안에서 돌고 있으면 설치할 게 없다.
  if (mode === INSTALL_MODES.NATIVE) return null;

  const handleInstall = async () => {
    setOutcome(await install());
  };

  return (
    <div className="settings-group">
      <span className="settings-label">앱으로 설치</span>

      {mode === INSTALL_MODES.INSTALLED && (
        <p className="install-done">
          <Check size={18} aria-hidden="true" /> 이미 앱으로 설치되어 있습니다.
        </p>
      )}

      {mode === INSTALL_MODES.PROMPT && (
        <>
          <button className="btn btn-primary btn-block" onClick={handleInstall}>
            <Smartphone size={22} aria-hidden="true" /> 홈 화면에 앱 설치
          </button>
          {outcome === 'dismissed' && (
            <p className="settings-hint">설치를 취소했습니다. 언제든 다시 누르세요.</p>
          )}
        </>
      )}

      {mode === INSTALL_MODES.IOS_MANUAL && (
        <ol className="install-steps">
          <li>
            사파리 아래쪽 <Share size={16} aria-hidden="true" /> <strong>공유</strong> 버튼을
            누릅니다.
          </li>
          <li>
            메뉴를 내려서 <strong>홈 화면에 추가</strong>를 고릅니다.
          </li>
          <li>
            오른쪽 위 <strong>추가</strong>를 누르면 끝입니다.
          </li>
        </ol>
      )}

      {mode === INSTALL_MODES.UNSUPPORTED && (
        <p className="settings-hint">
          이 브라우저는 홈 화면 설치를 지원하지 않습니다. 안드로이드 크롬이나 iOS 사파리로 열면
          설치할 수 있습니다.
        </p>
      )}

      {mode !== INSTALL_MODES.INSTALLED && (
        <p className="settings-hint">
          설치하면 주소창 없이 전체 화면으로 뜨고, 오프라인에서도 열립니다.
        </p>
      )}

      <a
        className="btn btn-secondary btn-block install-apk"
        href={ANDROID_APK_URL}
        target="_blank"
        rel="noreferrer"
      >
        <Download size={20} aria-hidden="true" /> 안드로이드 앱(APK) 내려받기
      </a>
      <p className="settings-hint">
        GitHub Releases 에서 받습니다. 설치하려면 &apos;출처를 알 수 없는 앱&apos; 허용이
        필요합니다.
      </p>
    </div>
  );
}
