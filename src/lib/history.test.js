import { describe, expect, it } from 'vitest';
import { lastDays } from './history';

const today = new Date(2026, 7, 2); // 2026-08-02

describe('lastDays', () => {
  it('오늘까지 요청한 날짜 수만큼 돌려준다', () => {
    const days = lastDays({}, 5, today);
    expect(days).toHaveLength(5);
    expect(days.at(-1).key).toBe('2026-08-02');
    expect(days[0].key).toBe('2026-07-29');
  });

  it('기록이 없는 날도 0 으로 채운다', () => {
    // 쉰 날이 차트에서 빠지면 그래프가 거짓말을 한다.
    const days = lastDays({ '2026-08-02': { correct: 3, wrong: 1, idk: 0 } }, 3, today);
    expect(days.map((day) => day.total)).toEqual([0, 0, 4]);
  });

  it('기록을 정확히 옮긴다', () => {
    const history = { '2026-08-01': { correct: 5, wrong: 2, idk: 1 } };
    const [yesterday] = lastDays(history, 2, today);
    expect(yesterday).toMatchObject({ correct: 5, wrong: 2, idk: 1, total: 8 });
  });

  it('달을 넘어가도 날짜가 맞다', () => {
    const days = lastDays({}, 3, new Date(2026, 8, 1)); // 2026-09-01
    expect(days.map((day) => day.key)).toEqual(['2026-08-30', '2026-08-31', '2026-09-01']);
  });

  it('윤년 2월도 맞다', () => {
    const days = lastDays({}, 2, new Date(2028, 2, 1)); // 2028-03-01 (윤년)
    expect(days.map((day) => day.key)).toEqual(['2028-02-29', '2028-03-01']);
  });

  it('차트 라벨은 월/일', () => {
    expect(lastDays({}, 1, today)[0].label).toBe('8/2');
  });

  it('history 가 없어도 던지지 않는다', () => {
    expect(lastDays(undefined, 2, today).map((day) => day.total)).toEqual([0, 0]);
  });
});
