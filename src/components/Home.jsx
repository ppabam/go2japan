import { BarChart2, Play, Settings } from 'lucide-react';

export default function Home({ onNavigate, deckSize }) {
  return (
    <div className="glass-panel home-panel">
      <h1 className="header-title">Go2Japan</h1>
      <p className="home-subtitle">일본어 정복의 길은 멀고도 험하다...</p>

      <div className="mascot" aria-hidden="true">
        👹
      </div>

      <div className="home-menu">
        <button className="btn btn-primary" onClick={() => onNavigate('practice')}>
          <Play size={24} aria-hidden="true" /> 지금 당장 연습하기
        </button>
        <button className="btn btn-secondary" onClick={() => onNavigate('stats')}>
          <BarChart2 size={24} aria-hidden="true" /> 내 처참한 실력 보기
        </button>
        <button className="btn btn-accent" onClick={() => onNavigate('settings')}>
          <Settings size={24} aria-hidden="true" /> 설정 (도망가기)
        </button>
      </div>

      <p className="home-deck-hint">현재 학습 범위: {deckSize}자</p>
    </div>
  );
}
