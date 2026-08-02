// 연속 학습일(스트릭) 계산.
//
// 예전 구현은 `Math.ceil(Math.abs(now - lastMidnight) / 86400000)` 으로 간격을 쟀다.
// 어제 플레이하고 오늘 낮에 접속하면 1.6일 -> ceil 로 2 가 되어 항상 '끊김' 판정이 났고,
// 그래서 연속 스트릭이 구조적으로 쌓이지 않았다.
// 시각을 버리고 로컬 날짜(YYYY-MM-DD)끼리만 비교하면 이 문제가 사라진다.

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 예전 버전은 Date.toDateString() ("Sat Aug 02 2026") 을 저장했다. 그 값도 읽어준다.
export function toDateKey(stored) {
  if (typeof stored !== 'string' || stored.trim() === '') return null;
  if (ISO_DATE.test(stored)) return stored;
  const parsed = new Date(stored);
  return Number.isNaN(parsed.getTime()) ? null : dateKey(parsed);
}

export function daysBetween(fromKey, toKey) {
  const [fromYear, fromMonth, fromDay] = fromKey.split('-').map(Number);
  const [toYear, toMonth, toDay] = toKey.split('-').map(Number);
  // UTC 로 환산해서 서머타임 때문에 하루가 23/25시간이 되는 경우를 피한다.
  const from = Date.UTC(fromYear, fromMonth - 1, fromDay);
  const to = Date.UTC(toYear, toMonth - 1, toDay);
  return Math.round((to - from) / 86_400_000);
}

// 앱을 켤 때 저장된 기록으로 현재 스트릭을 복원한다.
// 오늘(0일 차) 또는 어제(1일 차)까지 플레이했으면 유지, 그보다 벌어졌으면 끊긴 것으로 본다.
export function resumeStreak(storedLast, storedStreak, todayKey = dateKey()) {
  const lastPlayed = toDateKey(storedLast);
  const parsedStreak = Number(storedStreak);
  const streak = Number.isFinite(parsedStreak) ? Math.max(0, Math.trunc(parsedStreak)) : 0;

  if (!lastPlayed) return { streak: 0, lastPlayed: null };

  const gap = daysBetween(lastPlayed, todayKey);
  if (gap === 0 || gap === 1) return { streak: Math.max(streak, 1), lastPlayed };

  return { streak: 0, lastPlayed: null };
}

// 오늘 처음 문제를 풀었을 때의 새 스트릭.
// 어제 이어서 풀었으면 +1, 오래 쉬었으면 1 부터 다시 시작한다.
export function nextStreak(streak, lastPlayed, todayKey = dateKey()) {
  if (lastPlayed === todayKey) return streak;
  if (lastPlayed && daysBetween(lastPlayed, todayKey) === 1) return streak + 1;
  return 1;
}
