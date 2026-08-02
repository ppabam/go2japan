// 문자표.
//
// 가타카나는 히라가나와 유니코드 상 정확히 0x60 만큼 떨어져 있어서(あ U+3042 -> ア U+30A2)
// 읽기 정보를 히라가나 한 벌만 적어두고 가타카나는 코드포인트로 파생시킨다.
// 두 벌을 손으로 적어두면 한쪽만 고쳐지는 사고가 나기 쉽다.

// 오십음도 46자
const gojuon = [
  { char: 'あ', romaji: 'a', korean: '아' },
  { char: 'い', romaji: 'i', korean: '이' },
  { char: 'う', romaji: 'u', korean: '우' },
  { char: 'え', romaji: 'e', korean: '에' },
  { char: 'お', romaji: 'o', korean: '오' },
  { char: 'か', romaji: 'ka', korean: '카' },
  { char: 'き', romaji: 'ki', korean: '키' },
  { char: 'く', romaji: 'ku', korean: '쿠' },
  { char: 'け', romaji: 'ke', korean: '케' },
  { char: 'こ', romaji: 'ko', korean: '코' },
  { char: 'さ', romaji: 'sa', korean: '사' },
  { char: 'し', romaji: 'shi', korean: '시' },
  { char: 'す', romaji: 'su', korean: '스' },
  { char: 'せ', romaji: 'se', korean: '세' },
  { char: 'そ', romaji: 'so', korean: '소' },
  { char: 'た', romaji: 'ta', korean: '타' },
  { char: 'ち', romaji: 'chi', korean: '치' },
  { char: 'つ', romaji: 'tsu', korean: '츠' },
  { char: 'て', romaji: 'te', korean: '테' },
  { char: 'と', romaji: 'to', korean: '토' },
  { char: 'な', romaji: 'na', korean: '나' },
  { char: 'に', romaji: 'ni', korean: '니' },
  { char: 'ぬ', romaji: 'nu', korean: '누' },
  { char: 'ね', romaji: 'ne', korean: '네' },
  { char: 'の', romaji: 'no', korean: '노' },
  { char: 'は', romaji: 'ha', korean: '하' },
  { char: 'ひ', romaji: 'hi', korean: '히' },
  { char: 'ふ', romaji: 'fu', korean: '후' },
  { char: 'へ', romaji: 'he', korean: '헤' },
  { char: 'ほ', romaji: 'ho', korean: '호' },
  { char: 'ま', romaji: 'ma', korean: '마' },
  { char: 'み', romaji: 'mi', korean: '미' },
  { char: 'む', romaji: 'mu', korean: '무' },
  { char: 'め', romaji: 'me', korean: '메' },
  { char: 'も', romaji: 'mo', korean: '모' },
  { char: 'や', romaji: 'ya', korean: '야' },
  { char: 'ゆ', romaji: 'yu', korean: '유' },
  { char: 'よ', romaji: 'yo', korean: '요' },
  { char: 'ら', romaji: 'ra', korean: '라' },
  { char: 'り', romaji: 'ri', korean: '리' },
  { char: 'る', romaji: 'ru', korean: '루' },
  { char: 'れ', romaji: 're', korean: '레' },
  { char: 'ろ', romaji: 'ro', korean: '로' },
  { char: 'わ', romaji: 'wa', korean: '와' },
  { char: 'を', romaji: 'wo', korean: '오' },
  { char: 'ん', romaji: 'n', korean: '응' },
];

// 탁음·반탁음 25자
const dakuten = [
  { char: 'が', romaji: 'ga', korean: '가' },
  { char: 'ぎ', romaji: 'gi', korean: '기' },
  { char: 'ぐ', romaji: 'gu', korean: '구' },
  { char: 'げ', romaji: 'ge', korean: '게' },
  { char: 'ご', romaji: 'go', korean: '고' },
  { char: 'ざ', romaji: 'za', korean: '자' },
  { char: 'じ', romaji: 'ji', korean: '지' },
  { char: 'ず', romaji: 'zu', korean: '즈' },
  { char: 'ぜ', romaji: 'ze', korean: '제' },
  { char: 'ぞ', romaji: 'zo', korean: '조' },
  { char: 'だ', romaji: 'da', korean: '다' },
  { char: 'ぢ', romaji: 'ji', korean: '지' },
  { char: 'づ', romaji: 'zu', korean: '즈' },
  { char: 'で', romaji: 'de', korean: '데' },
  { char: 'ど', romaji: 'do', korean: '도' },
  { char: 'ば', romaji: 'ba', korean: '바' },
  { char: 'び', romaji: 'bi', korean: '비' },
  { char: 'ぶ', romaji: 'bu', korean: '부' },
  { char: 'べ', romaji: 'be', korean: '베' },
  { char: 'ぼ', romaji: 'bo', korean: '보' },
  { char: 'ぱ', romaji: 'pa', korean: '파' },
  { char: 'ぴ', romaji: 'pi', korean: '피' },
  { char: 'ぷ', romaji: 'pu', korean: '푸' },
  { char: 'ぺ', romaji: 'pe', korean: '페' },
  { char: 'ぽ', romaji: 'po', korean: '포' },
];

// 요음 33자
const youon = [
  { char: 'きゃ', romaji: 'kya', korean: '캬' },
  { char: 'きゅ', romaji: 'kyu', korean: '큐' },
  { char: 'きょ', romaji: 'kyo', korean: '쿄' },
  { char: 'しゃ', romaji: 'sha', korean: '샤' },
  { char: 'しゅ', romaji: 'shu', korean: '슈' },
  { char: 'しょ', romaji: 'sho', korean: '쇼' },
  { char: 'ちゃ', romaji: 'cha', korean: '차' },
  { char: 'ちゅ', romaji: 'chu', korean: '추' },
  { char: 'ちょ', romaji: 'cho', korean: '초' },
  { char: 'にゃ', romaji: 'nya', korean: '냐' },
  { char: 'にゅ', romaji: 'nyu', korean: '뉴' },
  { char: 'にょ', romaji: 'nyo', korean: '뇨' },
  { char: 'ひゃ', romaji: 'hya', korean: '햐' },
  { char: 'ひゅ', romaji: 'hyu', korean: '휴' },
  { char: 'ひょ', romaji: 'hyo', korean: '효' },
  { char: 'みゃ', romaji: 'mya', korean: '먀' },
  { char: 'みゅ', romaji: 'myu', korean: '뮤' },
  { char: 'みょ', romaji: 'myo', korean: '묘' },
  { char: 'りゃ', romaji: 'rya', korean: '랴' },
  { char: 'りゅ', romaji: 'ryu', korean: '류' },
  { char: 'りょ', romaji: 'ryo', korean: '료' },
  { char: 'ぎゃ', romaji: 'gya', korean: '갸' },
  { char: 'ぎゅ', romaji: 'gyu', korean: '규' },
  { char: 'ぎょ', romaji: 'gyo', korean: '교' },
  { char: 'じゃ', romaji: 'ja', korean: '자' },
  { char: 'じゅ', romaji: 'ju', korean: '주' },
  { char: 'じょ', romaji: 'jo', korean: '조' },
  { char: 'びゃ', romaji: 'bya', korean: '뱌' },
  { char: 'びゅ', romaji: 'byu', korean: '뷰' },
  { char: 'びょ', romaji: 'byo', korean: '뵤' },
  { char: 'ぴゃ', romaji: 'pya', korean: '퍄' },
  { char: 'ぴゅ', romaji: 'pyu', korean: '퓨' },
  { char: 'ぴょ', romaji: 'pyo', korean: '표' },
];

const KATAKANA_OFFSET = 0x60;

export const toKatakana = (kana) =>
  kana.replace(/[ぁ-ゖ]/gu, (character) =>
    String.fromCodePoint(character.codePointAt(0) + KATAKANA_OFFSET),
  );

const asHiragana = (rows, group) => rows.map((row) => ({ ...row, type: 'hiragana', group }));

const asKatakana = (rows, group) =>
  rows.map((row) => ({ ...row, char: toKatakana(row.char), type: 'katakana', group }));

export const hiragana = [
  ...asHiragana(gojuon, 'gojuon'),
  ...asHiragana(dakuten, 'dakuten'),
  ...asHiragana(youon, 'youon'),
];

export const katakana = [
  ...asKatakana(gojuon, 'gojuon'),
  ...asKatakana(dakuten, 'dakuten'),
  ...asKatakana(youon, 'youon'),
];

export const allCharacters = [...hiragana, ...katakana];

export const SCRIPTS = [
  { id: 'all', label: '전체' },
  { id: 'hiragana', label: '히라가나' },
  { id: 'katakana', label: '가타카나' },
];

// 학습 범위. 탁음·요음은 기본으로 빼두고 설정에서 켜게 한다.
export function selectDeck({ script = 'all', extended = false } = {}) {
  const base =
    script === 'hiragana' ? hiragana : script === 'katakana' ? katakana : allCharacters;
  return extended ? base : base.filter((character) => character.group === 'gojuon');
}
