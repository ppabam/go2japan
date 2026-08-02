import { BarChart2, BookOpen, Cat as CatIcon, Play, Settings } from 'lucide-react';

export default function Home({ onNavigate, deckSize, wordCount }) {
  return (
    <div className="glass-panel home-panel">
      <h1 className="header-title">Go2Japan</h1>
      <p className="home-subtitle">일본어 정복의 길은 멀고도 험하다...</p>

      <div className="mascot-home" aria-hidden="true">
        👹
      </div>

      <div className="home-menu">
        <button className="btn btn-primary" onClick={() => onNavigate('practice')}>
          <Play size={24} aria-hidden="true" /> 글자 연습하기
        </button>
        <button className="btn btn-word" onClick={() => onNavigate('words')}>
          <BookOpen size={24} aria-hidden="true" /> 쉬운 단어 연습하기
        </button>
        <button className="btn btn-pet" onClick={() => onNavigate('pet')}>
          <CatIcon size={24} aria-hidden="true" />{' '}
          <span lang="ja">わたしのねこ</span>
        </button>
        <button className="btn btn-secondary" onClick={() => onNavigate('stats')}>
          <BarChart2 size={24} aria-hidden="true" /> 내 처참한 실력 보기
        </button>
        <button className="btn btn-accent" onClick={() => onNavigate('settings')}>
          <Settings size={24} aria-hidden="true" /> 설정
        </button>
      </div>

      <p className="home-deck-hint">
        글자 {deckSize}자 · 단어 {wordCount}개
      </p>
    </div>
  );
}
