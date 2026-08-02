// localStorage 접근을 한곳으로 모은다.
// 사파리 프라이빗 모드나 저장 용량 초과에서는 read/write 모두 예외를 던지므로
// 전부 try/catch 로 감싸고, 값이 깨져 있으면 기본값으로 되돌린다.

const PREFIX = 'go2japan-';

export const KEYS = {
  weights: `${PREFIX}weights`,
  stats: `${PREFIX}stats`,
  streak: `${PREFIX}streak`,
  lastPlayed: `${PREFIX}last`,
  unknownWeight: `${PREFIX}unknown-weight`,
  script: `${PREFIX}script`,
  extended: `${PREFIX}extended`,
};

export const MIN_WEIGHT = 0.1;
export const MAX_WEIGHT = 30;
export const DEFAULT_WEIGHT = 1;
export const MASTERED_WEIGHT = 0.5;

export function loadRaw(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function saveRaw(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function loadJSON(key, fallback = null) {
  const raw = loadRaw(key);
  if (raw === null) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON(key, value) {
  return saveRaw(key, JSON.stringify(value));
}

export function removeKeys(keys) {
  for (const key of keys) {
    try {
      localStorage.removeItem(key);
    } catch {
      // 지우지 못해도 앱 동작에는 지장이 없다.
    }
  }
}

// 저장된 가중치를 현재 문자표에 맞춰 정규화한다.
// data.js 에 글자가 추가되면 저장본에는 그 키가 없어서 예전 코드는
// `rand -= undefined` 로 NaN 을 만들어 항상 첫 글자만 출제했다.
// 사라진 글자의 키가 남아 총합만 부풀리는 문제도 여기서 걸러진다.
export function normalizeWeights(saved, characters) {
  const normalized = {};
  for (const character of characters) {
    const value = Number(saved?.[character.char]);
    normalized[character.char] =
      Number.isFinite(value) && value > 0
        ? Math.min(Math.max(value, MIN_WEIGHT), MAX_WEIGHT)
        : DEFAULT_WEIGHT;
  }
  return normalized;
}

const toCount = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.trunc(number) : 0;
};

// '오늘 푼 문제' 는 날짜가 바뀌면 0 부터 다시 센다.
// 예전 버전은 날짜를 기록하지 않아 평생 누적 카운터였다.
export function normalizeStats(saved, todayKey) {
  const stats = {
    correct: toCount(saved?.correct),
    wrong: toCount(saved?.wrong),
    idk: toCount(saved?.idk),
    today: toCount(saved?.today),
    todayDate: typeof saved?.todayDate === 'string' ? saved.todayDate : null,
  };

  if (stats.todayDate !== todayKey) {
    stats.today = 0;
    stats.todayDate = todayKey;
  }

  return stats;
}

export function normalizeUnknownWeight(saved, fallback) {
  // Number(null) 과 Number('') 은 0 이라, 저장한 적 없는 값과 0 을 먼저 갈라놔야 한다.
  if (saved === null || saved === undefined) return fallback;
  if (typeof saved === 'string' && saved.trim() === '') return fallback;
  const value = Number(saved);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(Math.max(Math.round(value), 1), 20);
}
