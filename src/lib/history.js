import { dateKey } from './streak';

const EMPTY = { correct: 0, wrong: 0, idk: 0 };

// 오늘까지 최근 count 일을 빠짐없이 채워 돌려준다.
// 기록이 없는 날도 0 으로 넣어야 '쉰 날' 이 차트에 드러난다.
export function lastDays(history, count, today = new Date()) {
  const days = [];

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    // Date 생성자가 월·연 넘김을 알아서 처리한다. (3월 1일 -2일 -> 2월 27일)
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
    const key = dateKey(date);
    const tally = history?.[key] ?? EMPTY;

    days.push({
      key,
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      correct: tally.correct,
      wrong: tally.wrong,
      idk: tally.idk,
      total: tally.correct + tally.wrong + tally.idk,
    });
  }

  return days;
}
