import { describe, expect, it } from 'vitest';
import { allCharacters, selectDeck } from '../data';
import { OPTION_COUNT, buildQuestion, optionLabel, pickDistractors, pickWeighted } from './quiz';

// 결정적인 난수. 값이 모자라면 처음으로 돌아간다.
const sequence = (...values) => {
  let index = 0;
  return () => values[index++ % values.length];
};

const weightsOf = (characters, value = 1) =>
  Object.fromEntries(characters.map((character) => [character.char, value]));

describe('pickWeighted', () => {
  const deck = [{ char: 'あ' }, { char: 'い' }, { char: 'う' }];

  it('가중치 구간에 맞는 글자를 고른다', () => {
    const weights = { あ: 1, い: 1, う: 1 };
    expect(pickWeighted(deck, weights, () => 0).char).toBe('あ');
    expect(pickWeighted(deck, weights, () => 0.5).char).toBe('い');
    expect(pickWeighted(deck, weights, () => 0.9).char).toBe('う');
  });

  it('가중치가 큰 글자가 더 넓은 구간을 차지한다', () => {
    const weights = { あ: 1, い: 8, う: 1 };
    expect(pickWeighted(deck, weights, () => 0.5).char).toBe('い');
  });

  it('저장본에 없는 글자는 기본 가중치로 취급한다', () => {
    expect(pickWeighted(deck, {}, () => 0.5).char).toBe('い');
  });

  it('빈 덱이면 null', () => {
    expect(pickWeighted([], {}, () => 0)).toBeNull();
  });

  it('난수가 1 에 가까워도 항상 글자를 돌려준다', () => {
    expect(pickWeighted(deck, { あ: 1, い: 1, う: 1 }, () => 0.999999999)).not.toBeNull();
  });
});

describe('pickDistractors', () => {
  it('정답과 표시 문구가 같은 글자는 오답 보기에서 뺀다', () => {
    // あ 와 ア 는 둘 다 '아 (a)' 로 표시된다.
    const answer = allCharacters.find((character) => character.char === 'あ');
    const twin = allCharacters.find((character) => character.char === 'ア');
    const pool = [answer, twin, ...allCharacters.filter((c) => c.char === 'か')];

    const distractors = pickDistractors(answer, pool, 2, sequence(0));
    expect(distractors.map((c) => c.char)).not.toContain('ア');
  });

  it('오답 보기끼리도 표시 문구가 겹치지 않는다', () => {
    const answer = allCharacters.find((character) => character.char === 'か');
    const distractors = pickDistractors(answer, allCharacters, 2, sequence(0.1, 0.7, 0.3));
    const labels = distractors.map(optionLabel);
    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe('buildQuestion', () => {
  const deck = selectDeck({ script: 'all', extended: true });
  const weights = weightsOf(deck);

  it('정답이 보기 안에 들어있다', () => {
    const question = buildQuestion(deck, weights, sequence(0.42, 0.13, 0.77, 0.05));
    expect(question.options).toContainEqual(question.answer);
  });

  it('보기 개수가 맞다', () => {
    const question = buildQuestion(deck, weights, sequence(0.42, 0.13, 0.77, 0.05));
    expect(question.options).toHaveLength(OPTION_COUNT);
  });

  it('전 문자표를 반복해도 화면에 같은 보기가 두 번 뜨지 않는다', () => {
    // 예전 코드는 글자만 비교해서 '아 (a)' 버튼 두 개 중 하나를 오답 처리했다.
    for (let index = 0; index < 500; index += 1) {
      const question = buildQuestion(deck, weights);
      const labels = question.options.map(optionLabel);
      expect(new Set(labels).size).toBe(labels.length);
    }
  });

  it('빈 덱이면 null', () => {
    expect(buildQuestion([], {})).toBeNull();
  });
});

describe('selectDeck', () => {
  it('기본은 오십음도만 출제한다', () => {
    expect(selectDeck({ script: 'hiragana' })).toHaveLength(46);
    expect(selectDeck({ script: 'katakana' })).toHaveLength(46);
    expect(selectDeck({ script: 'all' })).toHaveLength(92);
  });

  it('확장 문자를 켜면 탁음·요음이 붙는다', () => {
    expect(selectDeck({ script: 'hiragana', extended: true })).toHaveLength(46 + 25 + 33);
  });

  it('가타카나는 히라가나에서 파생된다', () => {
    const katakanaDeck = selectDeck({ script: 'katakana', extended: true });
    expect(katakanaDeck.find((c) => c.romaji === 'a').char).toBe('ア');
    expect(katakanaDeck.find((c) => c.romaji === 'kya').char).toBe('キャ');
    expect(katakanaDeck.find((c) => c.romaji === 'po').char).toBe('ポ');
    expect(katakanaDeck.every((c) => c.type === 'katakana')).toBe(true);
  });
});
