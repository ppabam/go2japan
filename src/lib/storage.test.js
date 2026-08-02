import { describe, expect, it } from 'vitest';
import {
  HISTORY_DAYS,
  MAX_WEIGHT,
  normalizeStats,
  normalizeUnknownWeight,
  normalizeWeights,
} from './storage';

const characters = [{ char: 'あ' }, { char: 'い' }, { char: 'う' }];

describe('normalizeWeights', () => {
  it('저장본이 없으면 전부 기본 가중치 1', () => {
    expect(normalizeWeights(null, characters)).toEqual({ あ: 1, い: 1, う: 1 });
  });

  it('새로 추가된 글자에도 기본값을 채운다', () => {
    // 이 값이 undefined 로 남으면 출제 루프가 NaN 이 되어 항상 첫 글자만 나왔다.
    expect(normalizeWeights({ あ: 3 }, characters)).toEqual({ あ: 3, い: 1, う: 1 });
  });

  it('문자표에서 사라진 키는 버린다', () => {
    expect(normalizeWeights({ あ: 2, ㅁ: 99 }, characters)).not.toHaveProperty('ㅁ');
  });

  it('숫자가 아니거나 0 이하인 값은 기본값으로 되돌린다', () => {
    expect(normalizeWeights({ あ: 'x', い: 0, う: -5 }, characters)).toEqual({
      あ: 1,
      い: 1,
      う: 1,
    });
  });

  it('상한을 넘는 값은 잘라낸다', () => {
    expect(normalizeWeights({ あ: 9999 }, characters).あ).toBe(MAX_WEIGHT);
  });

  it('깨진 저장본(문자열/배열)이어도 던지지 않는다', () => {
    expect(normalizeWeights('broken', characters)).toEqual({ あ: 1, い: 1, う: 1 });
    expect(normalizeWeights([], characters)).toEqual({ あ: 1, い: 1, う: 1 });
  });
});

describe('normalizeStats', () => {
  it('날짜가 그대로면 오늘 카운트를 유지한다', () => {
    const saved = { correct: 3, wrong: 1, idk: 2, today: 6, todayDate: '2026-08-02' };
    expect(normalizeStats(saved, '2026-08-02')).toMatchObject(saved);
  });

  it('날짜가 바뀌면 오늘 카운트만 0 으로 되돌린다', () => {
    const saved = { correct: 3, wrong: 1, idk: 2, today: 6, todayDate: '2026-08-01' };
    expect(normalizeStats(saved, '2026-08-02')).toMatchObject({
      correct: 3,
      wrong: 1,
      idk: 2,
      today: 0,
      todayDate: '2026-08-02',
    });
  });

  it('날짜 정보가 없던 예전 저장본도 오늘 기준으로 초기화한다', () => {
    expect(normalizeStats({ correct: 10, today: 999 }, '2026-08-02')).toMatchObject({
      correct: 10,
      wrong: 0,
      idk: 0,
      today: 0,
      todayDate: '2026-08-02',
    });
  });

  it('음수나 문자열은 0 으로 본다', () => {
    expect(normalizeStats({ correct: -3, wrong: 'x' }, '2026-08-02')).toMatchObject({
      correct: 0,
      wrong: 0,
    });
  });
});

describe('normalizeUnknownWeight', () => {
  it('저장된 문자열을 숫자로 되돌린다', () => {
    expect(normalizeUnknownWeight('12', 5)).toBe(12);
  });

  it('범위를 벗어나면 잘라낸다', () => {
    expect(normalizeUnknownWeight('0', 5)).toBe(1);
    expect(normalizeUnknownWeight('999', 5)).toBe(20);
  });

  it('읽을 수 없으면 기본값', () => {
    expect(normalizeUnknownWeight(null, 5)).toBe(5);
    expect(normalizeUnknownWeight('abc', 5)).toBe(5);
  });
});

describe('normalizeStats — 일별 기록', () => {
  it('history 가 없던 예전 저장본도 빈 객체로 채운다', () => {
    const stats = normalizeStats({ correct: 5 }, '2026-08-02');
    expect(stats.history).toEqual({});
    expect(stats.todayChars).toEqual({});
  });

  it('날짜 형식이 아닌 키는 버린다', () => {
    const stats = normalizeStats(
      { history: { '2026-08-01': { correct: 2 }, 어제: { correct: 9 } } },
      '2026-08-02',
    );
    expect(Object.keys(stats.history)).toEqual(['2026-08-01']);
  });

  it('오래된 날짜는 최근 것만 남긴다', () => {
    const history = {};
    for (let day = 1; day <= 90; day += 1) {
      history[`2026-01-${String(day % 28 || 28).padStart(2, '0')}`] = { correct: 1 };
    }
    expect(Object.keys(normalizeStats({ history }, '2026-08-02').history).length).toBeLessThanOrEqual(
      HISTORY_DAYS,
    );
  });

  it('날짜가 바뀌면 오늘 푼 글자 목록도 비운다', () => {
    const saved = {
      todayDate: '2026-08-01',
      today: 12,
      todayChars: { あ: { correct: 3 } },
      history: { '2026-08-01': { correct: 12 } },
    };
    const stats = normalizeStats(saved, '2026-08-02');
    expect(stats.todayChars).toEqual({});
    expect(stats.today).toBe(0);
    // 지난 날 기록은 남아 있어야 일별 차트가 그려진다
    expect(stats.history['2026-08-01']).toMatchObject({ correct: 12 });
  });

  it('같은 날이면 오늘 푼 글자를 유지한다', () => {
    const saved = { todayDate: '2026-08-02', today: 4, todayChars: { あ: { correct: 2, wrong: 1 } } };
    expect(normalizeStats(saved, '2026-08-02').todayChars).toEqual({
      あ: { correct: 2, wrong: 1, idk: 0 },
    });
  });

  it('빈 집계는 버린다', () => {
    const stats = normalizeStats(
      { history: { '2026-08-01': { correct: 0, wrong: 0, idk: 0 } } },
      '2026-08-02',
    );
    expect(stats.history).toEqual({});
  });
});
