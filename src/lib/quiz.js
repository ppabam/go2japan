// 문제 출제 로직.
// random 을 주입받게 해서 테스트에서 결정적으로 검증할 수 있다.

export const OPTION_COUNT = 3;

// 보기 버튼에 찍히는 문구. 중복 판정과 화면 표시가 어긋나지 않도록 한 곳에서만 만든다.
export function optionLabel(character) {
  return `${character.korean} (${character.romaji})`;
}

export function pickWeighted(characters, weights, random = Math.random) {
  if (characters.length === 0) return null;

  let total = 0;
  for (const character of characters) total += weights[character.char] ?? 1;

  let point = random() * total;
  for (const character of characters) {
    const weight = weights[character.char] ?? 1;
    if (point < weight) return character;
    point -= weight;
  }

  // 부동소수점 오차로 끝까지 내려온 경우
  return characters[characters.length - 1];
}

export function shuffle(items, random = Math.random) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
  }
  return shuffled;
}

// 정답과 표시 문구가 겹치지 않는 오답 보기를 고른다.
// あ 와 ア 는 둘 다 '아 (a)' 로 표시되기 때문에, 예전 코드는 글자만 비교해서
// 화면상 완전히 똑같은 버튼 두 개를 만들고 그중 하나를 오답 처리했다.
export function pickDistractors(answer, pool, count, random = Math.random) {
  const usedLabels = new Set([optionLabel(answer)]);
  const candidates = [];

  for (const character of pool) {
    const label = optionLabel(character);
    if (usedLabels.has(label)) continue;
    usedLabels.add(label);
    candidates.push(character);
  }

  return shuffle(candidates, random).slice(0, count);
}

export function buildQuestion(characters, weights, random = Math.random) {
  const answer = pickWeighted(characters, weights, random);
  if (!answer) return null;

  const distractors = pickDistractors(answer, characters, OPTION_COUNT - 1, random);
  return { answer, options: shuffle([answer, ...distractors], random) };
}
