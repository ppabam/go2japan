import { useState } from 'react';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ChevronDown } from 'lucide-react';
import { DEFAULT_WEIGHT, MASTERED_WEIGHT, tallyTotal } from '../lib/storage';
import { lastDays } from '../lib/history';
import { optionLabel } from '../lib/quiz';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const WEAKEST_COUNT = 5;
const CHART_DAYS = 14;

const GREEN = 'rgba(46, 213, 115, 0.85)';
const RED = 'rgba(255, 71, 87, 0.85)';
const GREY = 'rgba(164, 176, 190, 0.85)';

function CharacterList({ items, emptyText }) {
  if (items.length === 0) return <p className="settings-hint">{emptyText}</p>;

  return (
    <ul className="char-list">
      {items.map(({ character, note }) => (
        <li key={character.char}>
          <span className="char-list-glyph" lang="ja">
            {character.char}
          </span>
          <span className="char-list-reading">{optionLabel(character)}</span>
          {note && <span className="char-list-note">{note}</span>}
        </li>
      ))}
    </ul>
  );
}

function ExpandableStat({ id, value, suffix, label, expanded, onToggle, children }) {
  return (
    <div className={`stat-card stat-card-expandable ${expanded ? 'open' : ''}`}>
      <button
        className="stat-card-trigger"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={id}
      >
        <span className="stat-value">
          {value}
          {suffix && <small>{suffix}</small>}
        </span>
        <span className="stat-label">
          {label}
          <ChevronDown size={14} aria-hidden="true" className="stat-chevron" />
        </span>
      </button>
      {expanded && (
        <div className="stat-panel" id={id}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function Stats({ stats, weights, deck, mode = 'kana' }) {
  const [expanded, setExpanded] = useState(null);

  const total = stats.correct + stats.wrong + stats.idk;
  const accuracy = total === 0 ? 0 : Math.round((stats.correct / total) * 100);
  const unit = mode === 'words' ? '단어' : '글자';

  const byChar = new Map(deck.map((character) => [character.char, character]));
  const weightOf = (character) => weights[character.char] ?? DEFAULT_WEIGHT;

  const mastered = deck.filter((character) => weightOf(character) <= MASTERED_WEIGHT);

  const weakest = [...deck]
    .filter((character) => weightOf(character) > DEFAULT_WEIGHT)
    .sort((a, b) => weightOf(b) - weightOf(a))
    .slice(0, WEAKEST_COUNT);

  // 오늘 푼 것 중 지금 학습 범위에 있는 것만 보여준다.
  const todayItems = Object.entries(stats.todayChars)
    .filter(([char]) => byChar.has(char))
    .sort((a, b) => tallyTotal(b[1]) - tallyTotal(a[1]))
    .map(([char, tally]) => ({
      character: byChar.get(char),
      note: `${tally.correct}○ ${tally.wrong + tally.idk}✕`,
    }));

  const days = lastDays(stats.history, CHART_DAYS);
  const dailyChart = {
    labels: days.map((day) => day.label),
    datasets: [
      { label: '정답', data: days.map((d) => d.correct), backgroundColor: GREEN, stack: 'day' },
      { label: '오답', data: days.map((d) => d.wrong), backgroundColor: RED, stack: 'day' },
      { label: '모름', data: days.map((d) => d.idk), backgroundColor: GREY, stack: 'day' },
    ],
  };

  const dailyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: 'white', boxWidth: 12 } },
      title: { display: true, text: `최근 ${CHART_DAYS}일`, color: 'white', font: { size: 15 } },
    },
    scales: {
      x: { stacked: true, ticks: { color: 'white', font: { size: 10 } }, grid: { display: false } },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: { color: 'white', precision: 0 },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
    },
  };

  if (total === 0) {
    return (
      <div className="glass-panel">
        <h2 className="stats-header">📊 내 학습 리포트</h2>
        <p className="empty-state">
          아직 푼 문제가 없습니다.
          <br />한 문제라도 풀어야 처참한지 아닌지 알 수 있어요.
        </p>
      </div>
    );
  }

  const toggle = (key) => setExpanded((current) => (current === key ? null : key));

  return (
    <div className="glass-panel">
      <h2 className="stats-header">📊 내 학습 리포트</h2>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-value">{accuracy}%</span>
          <span className="stat-label">정답률</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{total}</span>
          <span className="stat-label">누적 문항</span>
        </div>

        <ExpandableStat
          id="today-panel"
          value={stats.today}
          label="오늘 푼 문제"
          expanded={expanded === 'today'}
          onToggle={() => toggle('today')}
        >
          <CharacterList
            items={todayItems}
            emptyText={`오늘 푼 ${unit}가 아직 없습니다.`}
          />
        </ExpandableStat>

        <ExpandableStat
          id="mastered-panel"
          value={mastered.length}
          suffix={`/${deck.length}`}
          label={`마스터한 ${unit}`}
          expanded={expanded === 'mastered'}
          onToggle={() => toggle('mastered')}
        >
          <CharacterList
            items={mastered.map((character) => ({ character }))}
            emptyText={`아직 마스터한 ${unit}가 없습니다. 계속 맞히면 채워집니다.`}
          />
        </ExpandableStat>
      </div>

      <div
        className="chart-container chart-daily"
        role="img"
        aria-label={`최근 ${CHART_DAYS}일 일별 학습량`}
      >
        <Bar data={dailyChart} options={dailyOptions} />
      </div>

      {weakest.length > 0 && (
        <div className="weak-list">
          <h3 className="weak-list-title">🔥 제일 약한 {unit}</h3>
          <CharacterList items={weakest.map((character) => ({ character }))} emptyText="" />
        </div>
      )}

      <p className="stats-verdict">
        {stats.correct > stats.wrong + stats.idk
          ? '오 좀 치는데? 이대로 가자!'
          : '분발해라 닝겐... 갈 길이 멀다.'}
      </p>
    </div>
  );
}
