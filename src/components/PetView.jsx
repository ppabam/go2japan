import { BookOpen, Play } from 'lucide-react';
import Cat from './Cat';
import { CAT_MAX, catMood, catStatusText, daysTogether, timeAgo } from '../lib/cat';

function Gauge({ label, value, tone }) {
  const percent = Math.round((value / CAT_MAX) * 100);

  return (
    <div className="pet-gauge">
      <span className="pet-gauge-label">{label}</span>
      <span className={`pet-gauge-track tone-${tone}`}>
        <span className="pet-gauge-fill" style={{ width: `${percent}%` }} />
      </span>
      <span className="pet-gauge-value">{percent}%</span>
    </div>
  );
}

export default function PetView({ cat, onNavigate, fedToday, now = Date.now() }) {
  const mood = catMood(cat);

  return (
    <div className="glass-panel pet-page">
      <h2 className="stats-header" lang="ja">
        わたしのねこ
      </h2>

      <div className="pet-portrait">
        <Cat mood={mood} />
      </div>

      <p className={`pet-status pet-status-${mood}`}>{catStatusText(cat)}</p>

      <div className="pet-gauges">
        <Gauge label="포만감" value={cat.fullness} tone="fullness" />
        <Gauge label="기분" value={cat.mood} tone="mood" />
      </div>

      <dl className="pet-facts">
        <div>
          <dt>함께한 지</dt>
          <dd>{daysTogether(cat, now)}일</dd>
        </div>
        <div>
          <dt>마지막 밥</dt>
          <dd>{timeAgo(cat.fedAt, now)}</dd>
        </div>
        <div>
          <dt>오늘 준 밥</dt>
          <dd>{fedToday}그릇</dd>
        </div>
      </dl>

      <p className="pet-hint">
        밥은 문제를 맞혀야 나옵니다. 오래 안 오면 배가 고파지니 가끔 들러주세요.
      </p>

      <div className="pet-actions">
        <button className="btn btn-primary" onClick={() => onNavigate('practice')}>
          <Play size={22} aria-hidden="true" /> 글자 연습
        </button>
        <button className="btn btn-word" onClick={() => onNavigate('words')}>
          <BookOpen size={22} aria-hidden="true" /> 단어 연습
        </button>
      </div>
    </div>
  );
}
