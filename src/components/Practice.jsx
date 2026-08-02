import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Volume2 } from 'lucide-react';
import Cat from './Cat';
import CatMeters from './CatMeters';
import { SLOW_ANSWER_MS, catMood } from '../lib/cat';
import { buildQuestion, optionLabel } from '../lib/quiz';

const CORRECT_MESSAGES = ['오~ 천재인데?', '이걸 맞추다니!', '일본인 아니야?', '갓벽하다!', '폼 미쳤다 ㄷㄷ'];
const WRONG_MESSAGES = [
  '아깝다! 다시 해봐',
  '이걸 틀려?',
  '정신 안 차려?',
  '아... 눈물이 앞을 가린다',
  '괜찮아 원숭이도 나무에서 떨어지지',
];

// 맞혔을 때만 자동으로 넘어간다. 틀렸을 땐 정답을 읽을 시간을 뺏지 않는다.
const AUTO_ADVANCE_MS = 1400;

const randomOf = (messages) => messages[Math.floor(Math.random() * messages.length)];

// 단어는 글자가 여러 개라 한 크기로 고정하면 좁은 화면에서 넘친다.
const sizeBucket = (text) => {
  const glyphs = [...text].length;
  if (glyphs <= 1) return 'xl';
  if (glyphs <= 2) return 'lg';
  if (glyphs <= 4) return 'md';
  return 'sm';
};

export default function Practice({ deck, weights, cat, onAnswer, mode = 'kana' }) {
  const [question, setQuestion] = useState(null);
  const [answered, setAnswered] = useState(null);
  // 답이 없는 채로 오래 두면 고양이가 지루해한다.
  const [bored, setBored] = useState(false);

  // 가중치는 문제를 뽑을 때만 필요하다. state 로 의존하면 답을 고를 때마다
  // 가중치가 갱신되면서 문제가 즉시 다시 생성되어 피드백이 지워졌다.
  const weightsRef = useRef(weights);
  const timerRef = useRef(null);
  const boredTimerRef = useRef(null);
  const askedAtRef = useRef(0);

  useEffect(() => {
    weightsRef.current = weights;
  }, [weights]);

  const startQuestion = (next) => {
    clearTimeout(timerRef.current);
    clearTimeout(boredTimerRef.current);
    timerRef.current = null;
    setAnswered(null);
    setBored(false);
    setQuestion(next);
    askedAtRef.current = Date.now();
    boredTimerRef.current = setTimeout(() => setBored(true), SLOW_ANSWER_MS);
  };

  // deck 은 App 에서 memo 되어 있어서 학습 범위가 바뀔 때만 새 문제를 낸다.
  // startQuestion 은 매 렌더마다 새로 만들어지지만 의존성에 넣지 않는다.
  // 넣으면 렌더마다 문제가 다시 생성돼, 예전에 피드백이 지워지던 버그가 그대로 돌아온다.
  useEffect(() => {
    startQuestion(buildQuestion(deck, weightsRef.current));
  }, [deck]);

  useEffect(
    () => () => {
      clearTimeout(timerRef.current);
      clearTimeout(boredTimerRef.current);
    },
    [],
  );

  const advance = () => {
    startQuestion(buildQuestion(deck, weightsRef.current));
  };

  const speak = () => {
    if (!question || !('speechSynthesis' in window)) return;
    // 연타하면 발음이 큐에 쌓여 한참 뒤에까지 들린다.
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(question.answer.char);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };

  const handleAnswer = (choice) => {
    if (!question || answered) return;

    clearTimeout(boredTimerRef.current);
    const elapsedMs = Date.now() - askedAtRef.current;
    const isIdk = choice === 'idk';
    const isCorrect = !isIdk && choice === question.answer.char;
    const result = isCorrect ? 'correct' : isIdk ? 'idk' : 'wrong';

    let message;
    if (isCorrect) {
      message = randomOf(CORRECT_MESSAGES);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    } else if (isIdk) {
      message = `정답: ${optionLabel(question.answer)}`;
    } else {
      message = `${randomOf(WRONG_MESSAGES)} (정답: ${optionLabel(question.answer)})`;
    }

    setAnswered({ choice, result, message });
    onAnswer({ char: question.answer.char, result, elapsedMs });

    if (isCorrect) {
      timerRef.current = setTimeout(advance, AUTO_ADVANCE_MS);
    }
  };

  // 항상 최신 상태를 보도록 매 렌더마다 다시 건다.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey || !question) return;

      if (event.key.toLowerCase() === 's') {
        event.preventDefault();
        speak();
        return;
      }

      if (answered) {
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
          advance();
        }
        return;
      }

      if (event.key === '0') {
        event.preventDefault();
        handleAnswer('idk');
        return;
      }

      const index = Number(event.key);
      if (Number.isInteger(index) && index >= 1 && index <= question.options.length) {
        event.preventDefault();
        handleAnswer(question.options[index - 1].char);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  if (deck.length === 0) {
    return (
      <div className="glass-panel">
        <p className="empty-state">학습할 문자가 없습니다. 설정에서 범위를 다시 골라주세요.</p>
      </div>
    );
  }

  if (!question) return null;

  const optionState = (option) => {
    if (!answered) return '';
    if (option.char === question.answer.char) return 'correct';
    if (option.char === answered.choice) return 'wrong';
    return 'dimmed';
  };

  const unit = mode === 'words' ? '단어' : '자';
  const prompt = mode === 'words' ? '무슨 뜻일까요?' : '이건 뭘까요?';
  const catFace = catMood(cat, { reaction: answered?.result ?? null, waiting: bored });

  return (
    <div className="practice-container glass-panel">
      <div className="practice-toolbar">
        <span className="deck-size">
          {deck.length}
          {unit} 중
        </span>
        <button className="icon-btn" onClick={speak} aria-label="일본어 발음 듣기 (단축키 S)">
          <Volume2 size={32} aria-hidden="true" />
        </button>
      </div>

      <div className="flashcard">
        <div className="character-display" data-size={sizeBucket(question.answer.char)} lang="ja">
          {question.answer.char}
        </div>
      </div>

      <div className="feedback-row">
        <div className="pet-slot">
          {/* key 를 바꿔 다시 마운트시켜야 답할 때마다 애니메이션이 새로 돈다 */}
          <div className={`pet ${answered ? 'reacting' : ''}`} key={answered?.result ?? 'idle'}>
            <Cat mood={catFace} />
          </div>
          <CatMeters cat={cat} />
        </div>
        <p
          className={`feedback-msg ${answered ? answered.result : ''}`}
          role="status"
          aria-live="polite"
        >
          {answered ? answered.message : prompt}
        </p>
      </div>

      <div className="options-grid">
        {question.options.map((option, index) => (
          <button
            key={option.char}
            className={`option-btn ${optionState(option)}`}
            onClick={() => handleAnswer(option.char)}
            disabled={Boolean(answered)}
          >
            <span className="option-index" aria-hidden="true">
              {index + 1}
            </span>
            {optionLabel(option)}
          </button>
        ))}

        {/* 답한 뒤에도 같은 칸을 써서 버튼 배치가 흔들리지 않게 한다 */}
        {answered ? (
          <button className="option-btn next-btn" onClick={advance}>
            다음 →
          </button>
        ) : (
          <button className="option-btn idk-btn" onClick={() => handleAnswer('idk')}>
            🤷 모르겠음
          </button>
        )}
      </div>

      <p className="kbd-hint">단축키 · 보기 1~3 · 모르겠음 0 · 다음 Space · 발음 S</p>
    </div>
  );
}
