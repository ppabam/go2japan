// 다마고치 고양이.
//
// 그림 파일이 아니라 인라인 SVG 다. 네이티브 앱은 웹 빌드를 파일 하나로 말아서
// 싣기 때문에 외부 이미지를 참조하면 오프라인에서 깨진다. SVG 는 번들 안에 그대로
// 들어가고 어떤 크기로 키워도 선명하다.

const MOODS = {
  idle: '설렁설렁 걸어다니는 고양이',
  happy: '배부르고 신난 고양이',
  sad: '시무룩한 고양이',
  hungry: '배고파하는 고양이',
  bored: '기다리다 지루해하는 고양이',
};

const FUR = '#ffbe76';
const FUR_DARK = '#f0932b';
const LINE = '#1e272e';

function Eyes({ mood }) {
  if (mood === 'happy') {
    // 웃느라 접힌 눈
    return (
      <g stroke={LINE} strokeWidth="3.5" strokeLinecap="round" fill="none">
        <path d="M32 46 q6 -8 12 0" />
        <path d="M56 46 q6 -8 12 0" />
      </g>
    );
  }

  if (mood === 'sad') {
    return (
      <g stroke={LINE} strokeWidth="3.5" strokeLinecap="round" fill="none">
        <path d="M32 44 q6 7 12 0" />
        <path d="M56 44 q6 7 12 0" />
      </g>
    );
  }

  if (mood === 'bored') {
    // 반쯤 감은 눈
    return (
      <g stroke={LINE} strokeWidth="3.5" strokeLinecap="round">
        <path d="M33 47 h11" />
        <path d="M57 47 h11" />
      </g>
    );
  }

  if (mood === 'hungry') {
    // 큼직하게 뜬 눈
    return (
      <g fill={LINE}>
        <ellipse cx="38" cy="46" rx="5" ry="6" />
        <ellipse cx="62" cy="46" rx="5" ry="6" />
        <circle cx="39.5" cy="44" r="1.6" fill="#ffffff" />
        <circle cx="63.5" cy="44" r="1.6" fill="#ffffff" />
      </g>
    );
  }

  return (
    <g fill={LINE}>
      <ellipse cx="38" cy="46" rx="4" ry="5" />
      <ellipse cx="62" cy="46" rx="4" ry="5" />
    </g>
  );
}

function Mouth({ mood }) {
  if (mood === 'happy') {
    // 벌린 입
    return <path d="M43 58 q7 9 14 0 z" fill={LINE} />;
  }
  if (mood === 'sad' || mood === 'hungry') {
    return (
      <path d="M44 62 q6 -6 12 0" stroke={LINE} strokeWidth="3" strokeLinecap="round" fill="none" />
    );
  }
  // 고양이 입 (ω)
  return (
    <path
      d="M44 57 q3 4 6 0 q3 4 6 0"
      stroke={LINE}
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
  );
}

export default function Cat({ mood = 'idle' }) {
  const label = MOODS[mood] ?? MOODS.idle;

  return (
    <svg className={`cat-svg cat-${mood}`} viewBox="0 0 100 100" role="img" aria-label={label}>
      {/* 꼬리 — 기분에 따라 흔드는 속도가 다르다 */}
      <path
        className="cat-tail"
        d="M76 74 q16 -2 12 -18"
        stroke={FUR_DARK}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />

      {/* 몸통 */}
      <ellipse cx="50" cy="76" rx="26" ry="16" fill={FUR} />

      {/* 앞발 */}
      <g fill={FUR_DARK}>
        <ellipse cx="38" cy="88" rx="7" ry="4.5" />
        <ellipse cx="62" cy="88" rx="7" ry="4.5" />
      </g>

      {/* 귀 */}
      <g fill={FUR}>
        <path d="M26 34 l1 -20 l17 11 z" />
        <path d="M74 34 l-1 -20 l-17 11 z" />
      </g>
      <g fill="#ff9ff3">
        <path d="M31 30 l0.5 -10 l8 5 z" />
        <path d="M69 30 l-0.5 -10 l-8 5 z" />
      </g>

      {/* 얼굴 */}
      <ellipse cx="50" cy="46" rx="30" ry="27" fill={FUR} />

      {/* 볼 */}
      <g fill="#ff9ff3" opacity="0.5">
        <ellipse cx="28" cy="54" rx="6" ry="4" />
        <ellipse cx="72" cy="54" rx="6" ry="4" />
      </g>

      <Eyes mood={mood} />

      {/* 코 */}
      <path d="M47 53 h6 l-3 3.5 z" fill="#ff6b81" />
      <Mouth mood={mood} />

      {/* 수염 */}
      <g stroke={LINE} strokeWidth="1.6" strokeLinecap="round" opacity="0.55">
        <path d="M20 50 h12" />
        <path d="M20 57 h12" />
        <path d="M80 50 h-12" />
        <path d="M80 57 h-12" />
      </g>

      {mood === 'happy' && (
        <g className="cat-hearts" fill="#ff4757">
          <path d="M14 26 a4 4 0 0 1 7 -2 a4 4 0 0 1 7 2 q0 5 -7 10 q-7 -5 -7 -10 z" />
          <path d="M78 18 a3 3 0 0 1 5 -1.5 a3 3 0 0 1 5 1.5 q0 3.6 -5 7 q-5 -3.4 -5 -7 z" />
        </g>
      )}

      {mood === 'sad' && (
        <path className="cat-tear" d="M64 52 q3 6 0 9 q-3 -3 0 -9 z" fill="#70a1ff" />
      )}

      {mood === 'hungry' && (
        <g className="cat-bowl">
          {/* 빈 밥그릇 */}
          <path d="M6 84 q12 14 24 0 z" fill="#dfe4ea" />
          <rect x="4" y="80" width="28" height="4.5" rx="2.2" fill="#a4b0be" />
        </g>
      )}

      {mood === 'bored' && (
        <g className="cat-zzz" fill={LINE} opacity="0.65" fontWeight="800">
          <text x="76" y="24" fontSize="13">
            z
          </text>
          <text x="86" y="14" fontSize="9">
            z
          </text>
        </g>
      )}
    </svg>
  );
}
