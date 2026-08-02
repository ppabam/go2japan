import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Flame, Home as HomeIcon } from 'lucide-react';
import Home from './components/Home';
import Practice from './components/Practice';
import SettingsView from './components/SettingsView';
import Stats from './components/Stats';
import { allCharacters, selectDeck } from './data';
import { words } from './words';
import { dateKey, nextStreak, resumeStreak } from './lib/streak';
import {
  DEFAULT_WEIGHT,
  EMPTY_TALLY,
  KEYS,
  MAX_WEIGHT,
  MIN_WEIGHT,
  loadJSON,
  loadRaw,
  normalizeStats,
  normalizeUnknownWeight,
  normalizeWeights,
  removeKeys,
  saveJSON,
  saveRaw,
} from './lib/storage';
import './App.css';

const VIEWS = ['home', 'practice', 'words', 'stats', 'settings'];
const DEFAULT_UNKNOWN_WEIGHT = 5;
const CORRECT_WEIGHT_STEP = 0.5;

// 글자와 단어가 각자 가중치를 갖는다. 저장본을 정규화할 때 둘 다 넘겨야
// 새로 추가된 쪽의 가중치가 비어 출제가 망가지지 않는다.
const LEARNABLES = [...allCharacters, ...words];

const viewFromHash = () => {
  const hash = window.location.hash.replace(/^#\/?/, '');
  return VIEWS.includes(hash) ? hash : 'home';
};

export default function App() {
  // 라우터를 쓰지 않으면 안드로이드에서 뒤로가기가 앱을 종료시킨다.
  // 해시만 맞춰줘도 뒤로가기와 딥링크가 동작한다.
  const [view, setView] = useState(viewFromHash);

  const [weights, setWeights] = useState(() =>
    normalizeWeights(loadJSON(KEYS.weights), LEARNABLES),
  );
  const [stats, setStats] = useState(() => normalizeStats(loadJSON(KEYS.stats), dateKey()));
  const [unknownWeight, setUnknownWeight] = useState(() =>
    normalizeUnknownWeight(loadRaw(KEYS.unknownWeight), DEFAULT_UNKNOWN_WEIGHT),
  );
  const [script, setScript] = useState(() => loadRaw(KEYS.script) ?? 'all');
  const [extended, setExtended] = useState(() => loadRaw(KEYS.extended) === 'true');
  const [streak, setStreak] = useState(0);
  // 리포트가 글자 기준인지 단어 기준인지. 마지막으로 연습한 쪽을 따라간다.
  const [mode, setMode] = useState(() => (loadRaw(KEYS.mode) === 'words' ? 'words' : 'kana'));

  // 스트릭은 '오늘 이미 반영했는지' 를 즉시 알아야 해서 ref 를 원본으로 둔다.
  const streakRef = useRef(0);
  const lastPlayedRef = useRef(null);

  const kanaDeck = useMemo(() => selectDeck({ script, extended }), [script, extended]);
  const deck = view === 'words' ? words : kanaDeck;
  const reportDeck = mode === 'words' ? words : kanaDeck;

  useEffect(() => {
    const onHashChange = () => setView(viewFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (view === 'practice') setMode('kana');
    else if (view === 'words') setMode('words');
  }, [view]);

  useEffect(() => {
    saveJSON(KEYS.weights, weights);
  }, [weights]);

  useEffect(() => {
    saveJSON(KEYS.stats, stats);
  }, [stats]);

  useEffect(() => {
    saveRaw(KEYS.unknownWeight, String(unknownWeight));
  }, [unknownWeight]);

  useEffect(() => {
    saveRaw(KEYS.script, script);
  }, [script]);

  useEffect(() => {
    saveRaw(KEYS.extended, String(extended));
  }, [extended]);

  useEffect(() => {
    saveRaw(KEYS.mode, mode);
  }, [mode]);

  useEffect(() => {
    const resumed = resumeStreak(loadRaw(KEYS.lastPlayed), loadRaw(KEYS.streak));
    streakRef.current = resumed.streak;
    lastPlayedRef.current = resumed.lastPlayed;
    setStreak(resumed.streak);
    saveRaw(KEYS.streak, String(resumed.streak));
    if (resumed.lastPlayed) saveRaw(KEYS.lastPlayed, resumed.lastPlayed);
    else removeKeys([KEYS.lastPlayed]);
  }, []);

  const navigate = useCallback((next) => {
    const target = next === 'home' ? '#/' : `#/${next}`;
    if (window.location.hash === target) setView(next);
    else window.location.hash = target;
  }, []);

  const bumpStreak = useCallback(() => {
    const today = dateKey();
    if (lastPlayedRef.current === today) return;

    const updated = nextStreak(streakRef.current, lastPlayedRef.current, today);
    streakRef.current = updated;
    lastPlayedRef.current = today;
    setStreak(updated);
    saveRaw(KEYS.streak, String(updated));
    saveRaw(KEYS.lastPlayed, today);

    if (updated === 1 || updated % 5 === 0) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }, []);

  const handleAnswer = useCallback(
    ({ char, result }) => {
      setWeights((previous) => {
        const current = previous[char] ?? DEFAULT_WEIGHT;
        const updated =
          result === 'correct'
            ? Math.max(MIN_WEIGHT, current - CORRECT_WEIGHT_STEP)
            : // 상한이 없으면 계속 틀린 글자 하나가 출제를 독점한다.
              Math.min(MAX_WEIGHT, current + unknownWeight);
        return { ...previous, [char]: updated };
      });

      setStats((previous) => {
        const today = dateKey();
        const rolled =
          previous.todayDate === today
            ? previous
            : { ...previous, today: 0, todayDate: today, todayChars: {} };

        const day = rolled.history[today] ?? EMPTY_TALLY;
        const entry = rolled.todayChars[char] ?? EMPTY_TALLY;
        const lifetime = rolled.charStats[char] ?? EMPTY_TALLY;

        return {
          ...rolled,
          [result]: rolled[result] + 1,
          today: rolled.today + 1,
          history: { ...rolled.history, [today]: { ...day, [result]: day[result] + 1 } },
          todayChars: { ...rolled.todayChars, [char]: { ...entry, [result]: entry[result] + 1 } },
          charStats: {
            ...rolled.charStats,
            [char]: { ...lifetime, [result]: lifetime[result] + 1 },
          },
        };
      });

      bumpStreak();
    },
    [bumpStreak, unknownWeight],
  );

  const resetProgress = useCallback(() => {
    removeKeys(Object.values(KEYS));
    streakRef.current = 0;
    lastPlayedRef.current = null;
    setStreak(0);
    setWeights(normalizeWeights(null, LEARNABLES));
    setStats(normalizeStats(null, dateKey()));
    setUnknownWeight(DEFAULT_UNKNOWN_WEIGHT);
    setScript('all');
    setExtended(false);
    setMode('kana');
  }, []);

  return (
    <>
      <nav className="navbar">
        <div className="streak-badge" title={`연속 학습 ${streak}일`}>
          <Flame size={20} fill="currentColor" aria-hidden="true" />
          <span>{streak}</span>
          <span className="sr-only">일 연속 학습 중</span>
        </div>
        {view !== 'home' && (
          <button className="icon-btn" onClick={() => navigate('home')} aria-label="홈으로">
            <HomeIcon size={28} aria-hidden="true" />
          </button>
        )}
      </nav>

      {view === 'home' && (
        <Home onNavigate={navigate} deckSize={kanaDeck.length} wordCount={words.length} />
      )}

      {view === 'practice' && (
        <Practice deck={deck} weights={weights} onAnswer={handleAnswer} mode="kana" />
      )}

      {view === 'words' && (
        <Practice deck={deck} weights={weights} onAnswer={handleAnswer} mode="words" />
      )}

      {view === 'stats' && (
        <Stats
          stats={stats}
          weights={weights}
          deck={reportDeck}
          learnables={LEARNABLES}
          mode={mode}
        />
      )}

      {view === 'settings' && (
        <SettingsView
          script={script}
          onScriptChange={setScript}
          extended={extended}
          onExtendedChange={setExtended}
          unknownWeight={unknownWeight}
          onUnknownWeightChange={setUnknownWeight}
          deckSize={kanaDeck.length}
          onReset={resetProgress}
        />
      )}
    </>
  );
}
