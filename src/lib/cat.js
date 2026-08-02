// 다마고치 고양이의 상태 계산.
//
// 앱을 껐다 켜도, 아예 안 켜도 시간은 흐른다. 그래서 상태를 매 순간 갱신하는 대신
// 마지막으로 계산한 시각(updatedAt)만 들고 있다가 필요할 때 경과분을 한 번에 반영한다.
// now 를 인자로 받아 테스트에서 시간을 마음대로 돌릴 수 있게 했다.

export const CAT_MAX = 100;

// 25시간이면 포만감이 바닥난다. 하루를 건너뛰면 눈에 띄라는 뜻이다.
export const HUNGER_PER_HOUR = 4;
export const BOREDOM_PER_HOUR = 3;

// 배가 이만큼 고프면 기분도 더 빨리 상한다.
export const HUNGRY_BELOW = 25;
export const SAD_BELOW = 30;

// 이 시간을 넘겨 답하면 기다리다 지루해한 것으로 본다.
export const SLOW_ANSWER_MS = 8000;

const HOUR_MS = 3_600_000;

// 정답이 곧 사료다. 먹이기 버튼이 따로 없다.
const ANSWER_EFFECT = {
  correct: { fullness: 6, mood: 4 },
  wrong: { fullness: -2, mood: -6 },
  idk: { fullness: -1, mood: -4 },
};

const SLOW_MOOD_PENALTY = -2;

const clamp = (value) => Math.min(CAT_MAX, Math.max(0, value));

const toStat = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? clamp(number) : fallback;
};

const toTime = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
};

export function newCat(now) {
  return { fullness: 70, mood: 70, updatedAt: now, bornAt: now, fedAt: now };
}

// 마지막 계산 시각부터 지금까지의 경과를 반영한다.
// 시계가 거꾸로 갔거나(음수) 저장본이 미래라면 아무것도 하지 않고 시각만 맞춘다.
export function decayCat(cat, now) {
  const elapsed = now - cat.updatedAt;
  if (elapsed <= 0) return { ...cat, updatedAt: now };

  const hours = elapsed / HOUR_MS;
  const fullness = clamp(cat.fullness - HUNGER_PER_HOUR * hours);

  // 배가 고픈 채로 오래 두면 기분은 더 빨리 상한다.
  const starving = fullness < HUNGRY_BELOW ? 1.5 : 1;
  const mood = clamp(cat.mood - BOREDOM_PER_HOUR * hours * starving);

  return { ...cat, fullness, mood, updatedAt: now };
}

export function normalizeCat(saved, now) {
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return newCat(now);

  const cat = {
    fullness: toStat(saved.fullness, 70),
    mood: toStat(saved.mood, 70),
    updatedAt: toTime(saved.updatedAt, now),
    bornAt: toTime(saved.bornAt, now),
    fedAt: toTime(saved.fedAt, now),
  };

  return decayCat(cat, now);
}

export function applyAnswer(cat, { result, elapsedMs = 0 }, now) {
  const effect = ANSWER_EFFECT[result];
  if (!effect) return decayCat(cat, now);

  const decayed = decayCat(cat, now);
  const slow = elapsedMs > SLOW_ANSWER_MS;

  return {
    ...decayed,
    fullness: clamp(decayed.fullness + effect.fullness),
    mood: clamp(decayed.mood + effect.mood + (slow ? SLOW_MOOD_PENALTY : 0)),
    fedAt: result === 'correct' ? now : decayed.fedAt,
  };
}

// 화면에 띄울 기분 하나로 정리한다. 방금 일어난 일이 평소 상태보다 우선한다.
export function catMood(cat, { reaction = null, waiting = false } = {}) {
  if (reaction === 'correct') return 'happy';
  if (reaction === 'wrong' || reaction === 'idk') return 'sad';
  if (waiting) return 'bored';
  if (cat.fullness < HUNGRY_BELOW) return 'hungry';
  if (cat.mood < SAD_BELOW) return 'sad';
  return 'idle';
}

const STATUS_TEXT = {
  happy: '배부르고 행복해요!',
  hungry: '배고파요... 문제 좀 풀어주세요',
  sad: '심심해요... 놀아주세요',
  sleepy: '기운이 없어요',
  idle: '오늘도 잘 부탁해요',
};

export function catStatusText(cat) {
  if (cat.fullness <= 5) return '너무 배고파서 움직일 힘도 없어요...';
  if (cat.fullness < HUNGRY_BELOW) return STATUS_TEXT.hungry;
  if (cat.mood < SAD_BELOW) return STATUS_TEXT.sad;
  if (cat.fullness > 80 && cat.mood > 70) return STATUS_TEXT.happy;
  return STATUS_TEXT.idle;
}

export function daysTogether(cat, now) {
  return Math.max(1, Math.floor((now - cat.bornAt) / (24 * HOUR_MS)) + 1);
}

// '3시간 전' 처럼 사람이 읽는 표현으로.
export function timeAgo(from, now) {
  const minutes = Math.floor((now - from) / 60_000);
  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분 전`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;

  return `${Math.floor(hours / 24)}일 전`;
}
