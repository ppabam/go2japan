import { describe, expect, it } from 'vitest';
import {
  CAT_MAX,
  HUNGER_PER_HOUR,
  SLOW_ANSWER_MS,
  applyAnswer,
  catMood,
  catStatusText,
  daysTogether,
  decayCat,
  newCat,
  normalizeCat,
  timeAgo,
} from './cat';

const HOUR = 3_600_000;
const NOW = 1_770_000_000_000;

const catAt = (overrides = {}) => ({ ...newCat(NOW), ...overrides });

describe('decayCat', () => {
  it('시간이 흐르면 배가 고파진다', () => {
    const cat = decayCat(catAt({ fullness: 100, mood: 100 }), NOW + 10 * HOUR);
    expect(cat.fullness).toBe(100 - HUNGER_PER_HOUR * 10);
    expect(cat.mood).toBeLessThan(100);
  });

  it('하루를 건너뛰면 포만감이 바닥난다', () => {
    // 이게 이 기능의 목적이다. 안 하면 눈에 띄어야 한다.
    expect(decayCat(catAt({ fullness: 100 }), NOW + 26 * HOUR).fullness).toBe(0);
  });

  it('아무리 오래 방치해도 0 아래로는 안 간다 (죽지 않는다)', () => {
    const cat = decayCat(catAt({ fullness: 100, mood: 100 }), NOW + 365 * 24 * HOUR);
    expect(cat.fullness).toBe(0);
    expect(cat.mood).toBe(0);
  });

  it('배고픈 채로 두면 기분이 더 빨리 상한다', () => {
    const full = decayCat(catAt({ fullness: 100, mood: 100 }), NOW + 5 * HOUR);
    const starving = decayCat(catAt({ fullness: 10, mood: 100 }), NOW + 5 * HOUR);
    expect(starving.mood).toBeLessThan(full.mood);
  });

  it('시계가 거꾸로 가도 값이 튀지 않는다', () => {
    // 기기 시각을 뒤로 돌리면 elapsed 가 음수가 된다. 회복으로 오해하면 안 된다.
    const cat = decayCat(catAt({ fullness: 40, mood: 40 }), NOW - 10 * HOUR);
    expect(cat.fullness).toBe(40);
    expect(cat.mood).toBe(40);
    expect(cat.updatedAt).toBe(NOW - 10 * HOUR);
  });
});

describe('normalizeCat', () => {
  it('저장본이 없으면 새 고양이', () => {
    expect(normalizeCat(null, NOW)).toEqual(newCat(NOW));
  });

  it('깨진 저장본이어도 던지지 않는다', () => {
    expect(normalizeCat('broken', NOW).fullness).toBeGreaterThan(0);
    expect(normalizeCat([], NOW).fullness).toBeGreaterThan(0);
    expect(normalizeCat({ fullness: 'x', mood: null }, NOW).fullness).toBe(70);
  });

  it('범위를 벗어난 값은 잘라낸다', () => {
    const cat = normalizeCat({ fullness: 999, mood: -50, updatedAt: NOW }, NOW);
    expect(cat.fullness).toBe(CAT_MAX);
    expect(cat.mood).toBe(0);
  });

  it('불러올 때 그동안의 경과를 반영한다', () => {
    const saved = { fullness: 100, mood: 100, updatedAt: NOW, bornAt: NOW, fedAt: NOW };
    expect(normalizeCat(saved, NOW + 5 * HOUR).fullness).toBe(100 - HUNGER_PER_HOUR * 5);
  });
});

describe('applyAnswer', () => {
  it('정답을 맞히면 배가 부르고 기분이 좋아진다', () => {
    const before = catAt({ fullness: 50, mood: 50 });
    const after = applyAnswer(before, { result: 'correct' }, NOW);
    expect(after.fullness).toBeGreaterThan(before.fullness);
    expect(after.mood).toBeGreaterThan(before.mood);
    expect(after.fedAt).toBe(NOW);
  });

  it('틀리면 슬퍼하고 배고파진다', () => {
    const after = applyAnswer(catAt({ fullness: 50, mood: 50 }), { result: 'wrong' }, NOW);
    expect(after.fullness).toBeLessThan(50);
    expect(after.mood).toBeLessThan(50);
  });

  it('오답은 밥 준 시각을 갱신하지 않는다', () => {
    const before = catAt({ fedAt: NOW - HOUR });
    expect(applyAnswer(before, { result: 'wrong' }, NOW).fedAt).toBe(NOW - HOUR);
  });

  it('아무리 맞혀도 100 을 넘지 않는다', () => {
    let cat = catAt({ fullness: 98, mood: 98 });
    for (let i = 0; i < 10; i += 1) cat = applyAnswer(cat, { result: 'correct' }, NOW);
    expect(cat.fullness).toBe(CAT_MAX);
    expect(cat.mood).toBe(CAT_MAX);
  });

  it('아무리 틀려도 0 아래로 안 간다', () => {
    let cat = catAt({ fullness: 3, mood: 3 });
    for (let i = 0; i < 10; i += 1) cat = applyAnswer(cat, { result: 'wrong' }, NOW);
    expect(cat.fullness).toBe(0);
    expect(cat.mood).toBe(0);
  });

  it('늦게 답하면 기다리다 지루해한 만큼 기분이 덜 오른다', () => {
    const before = catAt({ fullness: 50, mood: 50 });
    const quick = applyAnswer(before, { result: 'correct', elapsedMs: 1000 }, NOW);
    const slow = applyAnswer(before, { result: 'correct', elapsedMs: SLOW_ANSWER_MS + 1 }, NOW);
    expect(slow.mood).toBeLessThan(quick.mood);
  });

  it('모르는 결과값이 와도 경과만 반영하고 넘어간다', () => {
    const after = applyAnswer(catAt({ fullness: 50 }), { result: '???' }, NOW);
    expect(after.fullness).toBe(50);
  });
});

describe('catMood', () => {
  const healthy = catAt({ fullness: 80, mood: 80 });

  it('방금 맞혔으면 기뻐한다', () => {
    expect(catMood(healthy, { reaction: 'correct' })).toBe('happy');
  });

  it('방금 틀렸으면 슬퍼한다', () => {
    expect(catMood(healthy, { reaction: 'wrong' })).toBe('sad');
    expect(catMood(healthy, { reaction: 'idk' })).toBe('sad');
  });

  it('답을 오래 안 하면 지루해한다', () => {
    expect(catMood(healthy, { waiting: true })).toBe('bored');
  });

  it('방금 일어난 일이 평소 상태보다 우선한다', () => {
    const starving = catAt({ fullness: 5, mood: 5 });
    expect(catMood(starving, { reaction: 'correct' })).toBe('happy');
  });

  it('평소에는 배고픔 > 기분 순으로 본다', () => {
    expect(catMood(catAt({ fullness: 10, mood: 90 }))).toBe('hungry');
    expect(catMood(catAt({ fullness: 90, mood: 10 }))).toBe('sad');
    expect(catMood(healthy)).toBe('idle');
  });
});

describe('catStatusText', () => {
  it('상태에 맞는 문구를 고른다', () => {
    expect(catStatusText(catAt({ fullness: 2, mood: 50 }))).toContain('배고파');
    expect(catStatusText(catAt({ fullness: 10, mood: 50 }))).toContain('배고파');
    expect(catStatusText(catAt({ fullness: 90, mood: 10 }))).toContain('심심');
    expect(catStatusText(catAt({ fullness: 90, mood: 90 }))).toContain('행복');
  });
});

describe('daysTogether / timeAgo', () => {
  it('만난 첫날은 1일', () => {
    expect(daysTogether(catAt({ bornAt: NOW }), NOW)).toBe(1);
    expect(daysTogether(catAt({ bornAt: NOW - 11 * 24 * HOUR }), NOW)).toBe(12);
  });

  it('사람이 읽는 표현으로 바꾼다', () => {
    expect(timeAgo(NOW, NOW)).toBe('방금');
    expect(timeAgo(NOW - 5 * 60_000, NOW)).toBe('5분 전');
    expect(timeAgo(NOW - 3 * HOUR, NOW)).toBe('3시간 전');
    expect(timeAgo(NOW - 50 * HOUR, NOW)).toBe('2일 전');
  });
});
