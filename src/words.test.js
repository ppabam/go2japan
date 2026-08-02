import { describe, expect, it } from 'vitest';
import { words } from './words';
import { allCharacters } from './data';
import { OPTION_COUNT, buildQuestion, optionLabel } from './lib/quiz';

describe('단어 데이터', () => {
  it('글자 연습과 같은 모양이라 출제 로직을 그대로 쓴다', () => {
    for (const word of words) {
      expect(word).toMatchObject({
        char: expect.any(String),
        romaji: expect.any(String),
        korean: expect.any(String),
        type: 'word',
        group: 'word',
      });
    }
  });

  it('같은 단어가 두 번 들어있지 않다', () => {
    const chars = words.map((word) => word.char);
    expect(new Set(chars).size).toBe(chars.length);
  });

  it('보기 문구가 서로 겹치지 않는다', () => {
    // 겹치면 화면에 똑같은 버튼 두 개가 뜨고 그중 하나가 오답 처리된다.
    const labels = words.map(optionLabel);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('가나로만 이뤄져 있다 (한자 없음)', () => {
    const kanaOnly = /^[぀-ゟ゠-ヿー]+$/u;
    for (const word of words) {
      expect(word.char, `${word.char} (${word.romaji})`).toMatch(kanaOnly);
    }
  });

  it('글자 카드와 char 가 부딪히지 않는다', () => {
    // 가중치를 char 로 키잡기 때문에 겹치면 진행 상황이 섞인다.
    const characterChars = new Set(allCharacters.map((character) => character.char));
    const collisions = words.filter((word) => characterChars.has(word.char));
    expect(collisions).toEqual([]);
  });
});

describe('단어 출제', () => {
  const weights = Object.fromEntries(words.map((word) => [word.char, 1]));

  it('단어 덱으로도 문제가 만들어진다', () => {
    const question = buildQuestion(words, weights);
    expect(question.options).toHaveLength(OPTION_COUNT);
    expect(question.options).toContainEqual(question.answer);
    expect(question.answer.type).toBe('word');
  });

  it('반복해도 보기 문구가 중복되지 않는다', () => {
    for (let index = 0; index < 200; index += 1) {
      const labels = buildQuestion(words, weights).options.map(optionLabel);
      expect(new Set(labels).size).toBe(labels.length);
    }
  });
});
