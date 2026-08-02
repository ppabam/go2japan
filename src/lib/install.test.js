import { describe, expect, it } from 'vitest';
import { INSTALL_MODES, getInstallMode, isIOS } from './install';

const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const IPAD =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
const ANDROID =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const DESKTOP_MAC =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

describe('isIOS', () => {
  it('아이폰을 알아본다', () => {
    expect(isIOS(IPHONE)).toBe(true);
  });

  it('자신을 Macintosh 라고 하는 iPadOS 는 터치 지원으로 가른다', () => {
    expect(isIOS(IPAD, 5)).toBe(true);
    expect(isIOS(DESKTOP_MAC, 0)).toBe(false);
  });

  it('안드로이드는 아니다', () => {
    expect(isIOS(ANDROID, 5)).toBe(false);
  });
});

describe('getInstallMode', () => {
  it('네이티브 앱 안에서는 설치 안내를 감춘다', () => {
    expect(
      getInstallMode({ userAgent: ANDROID, isNativeApp: true, hasPrompt: true }),
    ).toBe(INSTALL_MODES.NATIVE);
  });

  it('이미 홈 화면 앱으로 켰으면 설치 완료로 본다', () => {
    expect(getInstallMode({ userAgent: ANDROID, isStandalone: true })).toBe(
      INSTALL_MODES.INSTALLED,
    );
  });

  it('설치 프롬프트를 받았으면 버튼을 보여준다', () => {
    expect(getInstallMode({ userAgent: ANDROID, hasPrompt: true })).toBe(INSTALL_MODES.PROMPT);
  });

  it('iOS 는 프롬프트가 없으므로 수동 안내로 넘어간다', () => {
    expect(getInstallMode({ userAgent: IPHONE, maxTouchPoints: 5 })).toBe(
      INSTALL_MODES.IOS_MANUAL,
    );
  });

  it('그 밖의 브라우저는 미지원으로 안내한다', () => {
    expect(getInstallMode({ userAgent: DESKTOP_MAC })).toBe(INSTALL_MODES.UNSUPPORTED);
  });

  it('네이티브 > 설치됨 > 프롬프트 순으로 우선한다', () => {
    expect(getInstallMode({ isNativeApp: true, isStandalone: true, hasPrompt: true })).toBe(
      INSTALL_MODES.NATIVE,
    );
    expect(getInstallMode({ isStandalone: true, hasPrompt: true })).toBe(
      INSTALL_MODES.INSTALLED,
    );
  });

  it('인자가 없어도 던지지 않는다', () => {
    expect(getInstallMode()).toBe(INSTALL_MODES.UNSUPPORTED);
  });
});
