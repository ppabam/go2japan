import { describe, expect, it } from 'vitest';
import { dateKey, daysBetween, nextStreak, resumeStreak, toDateKey } from './streak';

describe('dateKey / toDateKey', () => {
  it('로컬 날짜를 YYYY-MM-DD 로 만든다', () => {
    expect(dateKey(new Date(2026, 7, 2, 23, 30))).toBe('2026-08-02');
    expect(dateKey(new Date(2026, 0, 5, 0, 0))).toBe('2026-01-05');
  });

  it('예전 버전이 저장한 toDateString() 값도 읽는다', () => {
    expect(toDateKey(new Date(2026, 7, 2).toDateString())).toBe('2026-08-02');
  });

  it('읽을 수 없는 값은 null', () => {
    expect(toDateKey(null)).toBeNull();
    expect(toDateKey('')).toBeNull();
    expect(toDateKey('아무말')).toBeNull();
  });
});

describe('daysBetween', () => {
  it('하루 차이는 1', () => {
    expect(daysBetween('2026-08-01', '2026-08-02')).toBe(1);
  });

  it('달을 넘어가도 맞다', () => {
    expect(daysBetween('2026-07-31', '2026-08-01')).toBe(1);
  });

  it('서머타임 전환 구간에서도 하루는 하루다', () => {
    expect(daysBetween('2026-03-08', '2026-03-09')).toBe(1);
    expect(daysBetween('2026-11-01', '2026-11-02')).toBe(1);
  });
});

describe('resumeStreak', () => {
  it('어제 플레이했으면 스트릭을 유지한다', () => {
    // 예전 구현은 Math.ceil 로 1.6일을 2일로 세어 여기서 항상 0 으로 리셋했다.
    expect(resumeStreak('2026-08-01', '7', '2026-08-02')).toEqual({
      streak: 7,
      lastPlayed: '2026-08-01',
    });
  });

  it('오늘 이미 플레이했으면 그대로 유지한다', () => {
    expect(resumeStreak('2026-08-02', '7', '2026-08-02')).toEqual({
      streak: 7,
      lastPlayed: '2026-08-02',
    });
  });

  it('이틀 이상 쉬었으면 끊긴다', () => {
    expect(resumeStreak('2026-07-30', '7', '2026-08-02')).toEqual({
      streak: 0,
      lastPlayed: null,
    });
  });

  it('기록이 없으면 0 에서 시작한다', () => {
    expect(resumeStreak(null, null, '2026-08-02')).toEqual({ streak: 0, lastPlayed: null });
  });
});

describe('nextStreak', () => {
  it('오늘 이미 반영했으면 그대로 둔다', () => {
    // lastPlayed 를 복원하지 않던 예전 코드는 새로고침할 때마다 여기서 +1 했다.
    expect(nextStreak(4, '2026-08-02', '2026-08-02')).toBe(4);
  });

  it('어제 이어서 풀면 +1', () => {
    expect(nextStreak(4, '2026-08-01', '2026-08-02')).toBe(5);
  });

  it('오래 쉬었으면 1 부터 다시', () => {
    expect(nextStreak(4, '2026-07-01', '2026-08-02')).toBe(1);
  });

  it('첫 플레이는 1', () => {
    expect(nextStreak(0, null, '2026-08-02')).toBe(1);
  });
});
