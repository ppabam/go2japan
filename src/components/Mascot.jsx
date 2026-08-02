// 연습 화면의 도깨비 마스코트.
//
// 그림 파일이 아니라 인라인 SVG 다. 네이티브 앱은 웹 빌드를 파일 하나로 말아서
// 싣기 때문에 외부 이미지를 참조하면 오프라인에서 깨진다. SVG 는 번들 안에 그대로
// 들어가고 어떤 크기로 키워도 선명하다.

const MOODS = {
  idle: { label: '문제를 기다리는 도깨비' },
  correct: { label: '정답을 맞혀 신난 도깨비' },
  wrong: { label: '틀려서 우는 도깨비' },
  idk: { label: '어리둥절한 도깨비' },
};

const SKIN = { idle: '#ff6b81', correct: '#2ed573', wrong: '#ff4757', idk: '#a4b0be' };

function Eyes({ mood }) {
  if (mood === 'correct') {
    // 웃느라 접힌 눈
    return (
      <g stroke="#1e272e" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M28 44 q7 -9 14 0" />
        <path d="M58 44 q7 -9 14 0" />
      </g>
    );
  }

  if (mood === 'wrong') {
    // 아래로 처진 눈
    return (
      <g stroke="#1e272e" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M28 40 q7 9 14 0" />
        <path d="M58 40 q7 9 14 0" />
      </g>
    );
  }

  if (mood === 'idk') {
    // 한쪽만 치켜뜬 눈
    return (
      <g fill="#1e272e">
        <circle cx="35" cy="43" r="5" />
        <ellipse cx="65" cy="43" rx="5" ry="3" />
      </g>
    );
  }

  return (
    <g fill="#1e272e">
      <circle cx="35" cy="43" r="5.5" />
      <circle cx="65" cy="43" r="5.5" />
    </g>
  );
}

function Mouth({ mood }) {
  if (mood === 'correct') {
    // 활짝 벌린 입
    return <path d="M38 60 q12 16 24 0 z" fill="#1e272e" />;
  }
  if (mood === 'wrong') {
    return (
      <path d="M40 66 q10 -10 20 0" stroke="#1e272e" strokeWidth="4" strokeLinecap="round" fill="none" />
    );
  }
  if (mood === 'idk') {
    // 삐뚤빼뚤한 입
    return (
      <path
        d="M40 62 q5 -5 10 0 q5 5 10 0"
        stroke="#1e272e"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    );
  }
  return (
    <path d="M42 60 q8 8 16 0" stroke="#1e272e" strokeWidth="4" strokeLinecap="round" fill="none" />
  );
}

export default function Mascot({ mood = 'idle' }) {
  const { label } = MOODS[mood] ?? MOODS.idle;
  const skin = SKIN[mood] ?? SKIN.idle;

  return (
    <svg
      className={`mascot-svg mascot-${mood}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label={label}
    >
      {/* 뿔 */}
      <g fill="#ffd32a">
        <path d="M24 22 l6 -16 l8 14 z" />
        <path d="M76 22 l-6 -16 l-8 14 z" />
      </g>

      {/* 얼굴 */}
      <circle cx="50" cy="52" r="34" fill={skin} />

      {/* 볼 */}
      <g fill="#ffffff" opacity="0.28">
        <ellipse cx="24" cy="58" rx="7" ry="5" />
        <ellipse cx="76" cy="58" rx="7" ry="5" />
      </g>

      <Eyes mood={mood} />
      <Mouth mood={mood} />

      {/* 정답이면 반짝이, 오답이면 눈물 */}
      {mood === 'correct' && (
        <g fill="#ffd32a" className="mascot-sparkles">
          <path d="M12 24 l2.5 6 l6 2.5 l-6 2.5 l-2.5 6 l-2.5 -6 l-6 -2.5 l6 -2.5 z" />
          <path d="M88 30 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 z" />
        </g>
      )}

      {mood === 'wrong' && (
        <path className="mascot-tear" d="M65 50 q4 8 0 11 q-4 -3 0 -11 z" fill="#70a1ff" />
      )}
    </svg>
  );
}
