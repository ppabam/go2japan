import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Linking, Platform, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import html from './web/bundle';

const BACKGROUND = '#1e272e';
const ACCENT = '#ff4757';

// localStorage 는 출처(origin)에 묶인다. baseUrl 없이 HTML 만 실으면 about:blank 가 되어
// 진행 상황이 앱을 껐다 켤 때마다 사라진다. 웹 배포 주소를 출처로 준다.
const ORIGIN = 'https://go2japan.vercel.app/';

// 웹앱이 자기가 네이티브 앱 안이라는 걸 알아야 설정에서 '앱으로 설치' 안내를 감춘다.
const INJECT_BEFORE_LOAD = `
  window.__GO2JAPAN_NATIVE__ = true;
  true;
`;

export default function App() {
  const webViewRef = useRef(null);
  const canGoBackRef = useRef(false);
  const [loading, setLoading] = useState(true);

  // 안드로이드 뒤로가기: 웹앱 안에서 돌아갈 곳이 있으면 WebView 히스토리를 따라가고,
  // 홈이면 기본 동작(앱 종료)에 맡긴다.
  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!canGoBackRef.current) return false;
      webViewRef.current?.goBack();
      return true;
    });

    return () => subscription.remove();
  }, []);

  // APK 내려받기 같은 외부 링크는 앱 안에 가두지 않고 시스템 브라우저로 넘긴다.
  const onShouldStartLoadWithRequest = useCallback((request) => {
    const { url } = request;
    if (!url || url === 'about:blank' || url.startsWith(ORIGIN)) return true;

    Linking.openURL(url).catch(() => {
      // 열 수 없는 스킴이면 조용히 무시한다.
    });
    return false;
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={BACKGROUND} />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <WebView
          ref={webViewRef}
          source={{ html, baseUrl: ORIGIN }}
          originWhitelist={['*']}
          injectedJavaScriptBeforeContentLoaded={INJECT_BEFORE_LOAD}
          onNavigationStateChange={(state) => {
            canGoBackRef.current = state.canGoBack;
          }}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          onLoadEnd={() => setLoading(false)}
          javaScriptEnabled
          domStorageEnabled
          allowFileAccess={false}
          // 발음 듣기(Web Speech API)가 사용자 조작 없이도 나가도록
          mediaPlaybackRequiresUserAction={false}
          // 웹앱이 자체 배경을 그리므로 로딩 중 흰 화면이 번쩍이지 않게 한다
          style={styles.webview}
          containerStyle={styles.webview}
        />

        {loading && (
          <View style={styles.loading} pointerEvents="none">
            <ActivityIndicator size="large" color={ACCENT} />
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  webview: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BACKGROUND,
  },
});
