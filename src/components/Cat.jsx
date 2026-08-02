import React from 'react';

const MOODS = {
  idle: '설렁설렁 걸어다니는 고양이',
  happy: '배부르고 신난 고양이',
  sad: '시무룩한 고양이',
  hungry: '배고파하는 고양이',
  bored: '기다리다 지루해하는 고양이',
};

const FUR = 'url(#furGrad)';
const FUR_DARK = '#D97706';
const FUR_LIGHT = '#FDE68A';
const LINE = '#451A03';

function Eyes({ mood }) {
  if (mood === 'happy') {
    return (
      <g stroke={LINE} strokeWidth="3.5" strokeLinecap="round" fill="none">
        <path d="M30 46 q7 -10 14 0" />
        <path d="M56 46 q7 -10 14 0" />
      </g>
    );
  }
  if (mood === 'sad') {
    return (
      <g stroke={LINE} strokeWidth="3.5" strokeLinecap="round" fill="none">
        <path d="M30 42 q7 8 14 0" />
        <path d="M56 42 q7 8 14 0" />
      </g>
    );
  }
  if (mood === 'bored') {
    return (
      <g stroke={LINE} strokeWidth="3.5" strokeLinecap="round">
        <path d="M30 47 h14" />
        <path d="M56 47 h14" />
      </g>
    );
  }
  if (mood === 'hungry') {
    return (
      <g fill={LINE}>
        <ellipse cx="37" cy="46" rx="7" ry="9" />
        <ellipse cx="63" cy="46" rx="7" ry="9" />
        <circle cx="39" cy="43" r="3" fill="#ffffff" />
        <circle cx="65" cy="43" r="3" fill="#ffffff" />
        <circle cx="35" cy="48" r="1.5" fill="#ffffff" />
        <circle cx="61" cy="48" r="1.5" fill="#ffffff" />
      </g>
    );
  }
  return (
    <g fill={LINE} className="cat-eyes-normal">
      <ellipse cx="37" cy="46" rx="5" ry="7" />
      <ellipse cx="63" cy="46" rx="5" ry="7" />
      <circle cx="38.5" cy="44" r="2" fill="#ffffff" />
      <circle cx="64.5" cy="44" r="2" fill="#ffffff" />
    </g>
  );
}

function Mouth({ mood }) {
  if (mood === 'happy') {
    return <path d="M43 58 q7 12 14 0 z" fill="#EF4444" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />;
  }
  if (mood === 'sad' || mood === 'hungry') {
    return <path d="M44 62 q6 -6 12 0" stroke={LINE} strokeWidth="3" strokeLinecap="round" fill="none" />;
  }
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

export default function Cat({ mood = 'idle', variant = 'walking' }) {
  const label = MOODS[mood] ?? MOODS.idle;
  const isPortrait = variant === 'portrait';
  // Portrait view tightly crops the face and chest
  const viewBox = isPortrait ? "15 10 70 70" : "0 0 100 100";

  return (
    <svg className={`cat-svg cat-${mood} cat-variant-${variant}`} viewBox={viewBox} role="img" aria-label={label}>
      <defs>
        <linearGradient id="furGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <radialGradient id="blush" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FCA5A5" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#FCA5A5" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* 꼬리 */}
      <g className="cat-tail-group" transform="translate(65, 75)">
        <path
          className="cat-tail"
          d="M 0 0 C 20 0, 15 -25, 30 -45"
          stroke={FUR_DARK}
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* 뒷다리 */}
      <g className="cat-legs-back">
        <path className="cat-leg-back-left" d="M 32 70 Q 34 90 38 90 Q 42 90 40 70 Z" fill={FUR_DARK} />
        <path className="cat-leg-back-right" d="M 60 70 Q 62 90 66 90 Q 70 90 68 70 Z" fill={FUR_DARK} />
      </g>

      {/* 자태로운 몸통 (풍만한 쉐입) */}
      <path className="cat-body" d="M 32 45 C 18 65, 25 88, 40 90 L 60 90 C 75 88, 82 65, 68 45 Z" fill={FUR} />
      
      {/* 뱃살 (밝은 털) */}
      <path className="cat-belly" d="M 38 60 C 35 75, 40 88, 50 88 C 60 88, 65 75, 62 60 Z" fill={FUR_LIGHT} />

      {/* 앞다리 */}
      <g className="cat-legs-front">
        <path className="cat-leg-left" d="M 42 75 Q 43 92 46 92 Q 49 92 48 75 Z" fill="url(#furGrad)" />
        <path className="cat-leg-right" d="M 52 75 Q 53 92 56 92 Q 59 92 58 75 Z" fill="url(#furGrad)" />
      </g>

      {/* 목덜미 털 */}
      <path className="cat-scruff" d="M 35 48 Q 50 55 65 48 L 50 35 Z" fill={FUR_LIGHT} />

      {/* 얼굴 그룹 */}
      <g className="cat-head" transform="translate(0, 0)">
        {/* 귀 */}
        <g className="cat-ears">
          <path className="cat-ear-left" d="M22 35 L 20 10 L 42 25 Z" fill={FUR} />
          <path className="cat-ear-right" d="M78 35 L 80 10 L 58 25 Z" fill={FUR} />
          {/* 속귀 */}
          <path className="cat-ear-inner-left" d="M25 32 L 23 15 L 38 26 Z" fill="#FBCFE8" />
          <path className="cat-ear-inner-right" d="M75 32 L 77 15 L 62 26 Z" fill="#FBCFE8" />
        </g>

        {/* 얼굴 기본형 */}
        <ellipse cx="50" cy="46" rx="34" ry="29" fill={FUR} />
        
        {/* 주둥이(머즐) 부위 밝은 털 */}
        <ellipse cx="50" cy="54" rx="16" ry="11" fill={FUR_LIGHT} />

        {/* 볼터치 */}
        <g className="cat-blush">
          <circle cx="28" cy="54" r="8" fill="url(#blush)" />
          <circle cx="72" cy="54" r="8" fill="url(#blush)" />
        </g>

        <Eyes mood={mood} />

        {/* 코 */}
        <path d="M47 52 h6 l-3 4 z" fill="#F43F5E" />
        
        <Mouth mood={mood} />

        {/* 수염 (자연스러운 곡선) */}
        <g stroke={LINE} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" className="cat-whiskers">
          <path d="M 15 50 Q 5 48 2 52" />
          <path d="M 15 55 Q 5 55 4 60" />
          <path d="M 85 50 Q 95 48 98 52" />
          <path d="M 85 55 Q 95 55 96 60" />
        </g>

        {mood === 'happy' && (
          <g className="cat-hearts" fill="#EF4444">
            <path d="M12 24 a4 4 0 0 1 7 -2 a4 4 0 0 1 7 2 q0 5 -7 10 q-7 -5 -7 -10 z" />
            <path d="M82 16 a3 3 0 0 1 5 -1.5 a3 3 0 0 1 5 1.5 q0 3.6 -5 7 q-5 -3.4 -5 -7 z" />
          </g>
        )}

        {mood === 'sad' && (
          <path className="cat-tear" d="M68 53 q3 6 0 9 q-3 -3 0 -9 z" fill="#3B82F6" />
        )}

        {mood === 'bored' && (
          <g className="cat-zzz" fill={LINE} opacity="0.65" fontWeight="800">
            <text x="78" y="22" fontSize="14">z</text>
            <text x="88" y="10" fontSize="10">z</text>
          </g>
        )}
      </g>

      {mood === 'hungry' && (
        <g className="cat-bowl">
          <path d="M8 88 q12 10 24 0 z" fill="#E5E7EB" />
          <rect x="6" y="84" width="28" height="4.5" rx="2.2" fill="#9CA3AF" />
          <path d="M12 84 q8 -8 16 0" fill="#D97706" opacity="0.5" />
        </g>
      )}
    </svg>
  );
}
