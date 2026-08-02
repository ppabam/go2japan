// 초급 단어. 한자 없이 가나로만 이뤄진 것들만 골랐다.
// 글자 연습과 같은 모양({ char, romaji, korean })이라 출제 로직을 그대로 쓴다.

const entries = [
  // 시간
  { char: 'あさ', romaji: 'asa', korean: '아침' },
  { char: 'ひる', romaji: 'hiru', korean: '낮' },
  { char: 'よる', romaji: 'yoru', korean: '밤' },
  { char: 'きょう', romaji: 'kyou', korean: '오늘' },
  { char: 'あした', romaji: 'ashita', korean: '내일' },
  { char: 'きのう', romaji: 'kinou', korean: '어제' },
  { char: 'まいにち', romaji: 'mainichi', korean: '매일' },

  // 먹을 것
  { char: 'みず', romaji: 'mizu', korean: '물' },
  { char: 'おちゃ', romaji: 'ocha', korean: '차' },
  { char: 'ごはん', romaji: 'gohan', korean: '밥' },
  { char: 'にく', romaji: 'niku', korean: '고기' },
  { char: 'さかな', romaji: 'sakana', korean: '생선' },
  { char: 'やさい', romaji: 'yasai', korean: '채소' },
  { char: 'たまご', romaji: 'tamago', korean: '계란' },
  { char: 'くだもの', romaji: 'kudamono', korean: '과일' },
  { char: 'りんご', romaji: 'ringo', korean: '사과' },
  { char: 'パン', romaji: 'pan', korean: '빵' },
  { char: 'ミルク', romaji: 'miruku', korean: '우유' },

  // 동물
  { char: 'ねこ', romaji: 'neko', korean: '고양이' },
  { char: 'いぬ', romaji: 'inu', korean: '개' },
  { char: 'とり', romaji: 'tori', korean: '새' },
  { char: 'うま', romaji: 'uma', korean: '말' },
  { char: 'うし', romaji: 'ushi', korean: '소' },
  { char: 'さる', romaji: 'saru', korean: '원숭이' },

  // 자연
  { char: 'やま', romaji: 'yama', korean: '산' },
  { char: 'うみ', romaji: 'umi', korean: '바다' },
  { char: 'かわ', romaji: 'kawa', korean: '강' },
  { char: 'そら', romaji: 'sora', korean: '하늘' },
  { char: 'はな', romaji: 'hana', korean: '꽃' },
  { char: 'あめ', romaji: 'ame', korean: '비' },
  { char: 'ゆき', romaji: 'yuki', korean: '눈' },

  // 사람
  { char: 'ともだち', romaji: 'tomodachi', korean: '친구' },
  { char: 'かぞく', romaji: 'kazoku', korean: '가족' },
  { char: 'ちち', romaji: 'chichi', korean: '아버지' },
  { char: 'はは', romaji: 'haha', korean: '어머니' },
  { char: 'せんせい', romaji: 'sensei', korean: '선생님' },
  { char: 'がくせい', romaji: 'gakusei', korean: '학생' },
  { char: 'なまえ', romaji: 'namae', korean: '이름' },

  // 장소와 물건
  { char: 'いえ', romaji: 'ie', korean: '집' },
  { char: 'へや', romaji: 'heya', korean: '방' },
  { char: 'まど', romaji: 'mado', korean: '창문' },
  { char: 'がっこう', romaji: 'gakkou', korean: '학교' },
  { char: 'えき', romaji: 'eki', korean: '역' },
  { char: 'みせ', romaji: 'mise', korean: '가게' },
  { char: 'びょういん', romaji: 'byouin', korean: '병원' },
  { char: 'くるま', romaji: 'kuruma', korean: '자동차' },
  { char: 'でんしゃ', romaji: 'densha', korean: '전철' },
  { char: 'ほん', romaji: 'hon', korean: '책' },
  { char: 'えんぴつ', romaji: 'enpitsu', korean: '연필' },
  { char: 'かばん', romaji: 'kaban', korean: '가방' },
  { char: 'とけい', romaji: 'tokei', korean: '시계' },
  { char: 'おかね', romaji: 'okane', korean: '돈' },
  { char: 'でんわ', romaji: 'denwa', korean: '전화' },
  { char: 'てがみ', romaji: 'tegami', korean: '편지' },
  { char: 'しごと', romaji: 'shigoto', korean: '일' },
  { char: 'テレビ', romaji: 'terebi', korean: '텔레비전' },

  // 인사
  { char: 'ありがとう', romaji: 'arigatou', korean: '고마워요' },
  { char: 'こんにちは', romaji: 'konnichiwa', korean: '안녕하세요' },
  { char: 'おはよう', romaji: 'ohayou', korean: '좋은 아침' },
  { char: 'さようなら', romaji: 'sayounara', korean: '안녕히 가세요' },
  { char: 'すみません', romaji: 'sumimasen', korean: '죄송합니다' },
];

export const words = entries.map((entry) => ({ ...entry, type: 'word', group: 'word' }));
