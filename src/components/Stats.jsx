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
import { DEFAULT_WEIGHT, EMPTY_TALLY, MASTERED_WEIGHT, missedCount } from '../lib/storage';
import { lastDays } from '../lib/history';
import { optionLabel } from '../lib/quiz';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CHART_DAYS = 14;

const GREEN = 'rgba(46, 213, 115, 0.85)';
const RED = 'rgba(255, 71, 87, 0.85)';
const GREY = 'rgba(164, 176, 190, 0.85)';

const TYPE_LABELS = { hiragana: '히라가나', katakana: '가타카나', word: '단어' };

function ItemList({ items, emptyText, className = '' }) {
  if (items.length === 0) return <p className="settings-hint">{emptyText}</p>;

  return (
    <ul className={`char-list ${className}`}>
      {items.map(({ item, note }) => (
        <li key={item.char}>
          <span className="char-list-glyph" lang="ja">
            {item.char}
          </span>
          <span className="char-list-reading">{optionLabel(item)}</span>
          <span className="char-list-badge">{TYPE_LABELS[item.type] ?? ''}</span>
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

export default function Stats({ stats, weights, deck, learnables, mode = 'kana' }) {
  const [expanded, setExpanded] = useState(null);

  const total = stats.correct + stats.wrong + stats.idk;
  const accuracy = total === 0 ? 0 : Math.round((stats.correct / total) * 100);
  const unit = mode === 'words' ? '단어' : '글자';

  const weightOf = (item) => weights[item.char] ?? DEFAULT_WEIGHT;
  const tallyOf = (item) => stats.charStats[item.char] ?? EMPTY_TALLY;

  // 마스터 비율은 지금 고른 학습 범위 기준이라 deck 을 쓴다.
  const mastered = deck.filter((item) => weightOf(item) <= MASTERED_WEIGHT);

  // 틀린 것은 범위와 상관없이 전부 보여준다. 글자만 연습하다 단어로 넘어가도
  // 앞서 틀린 것이 목록에서 사라지면 복습할 방법이 없다.
  const mistakes = learnables
    .map((item) => ({ item, missed: missedCount(tallyOf(item)), weight: weightOf(item) }))
    .filter((row) => row.missed > 0 || row.weight > DEFAULT_WEIGHT)
    .sort((a, b) => b.missed - a.missed || b.weight - a.weight)
    .map(({ item, missed }) => ({
      item,
      // 이 버전 전에 틀린 것은 횟수 기록이 없다. 그때는 가중치만으로 목록에 올린다.
      note: missed > 0 ? `${missed}번 틀림` : '',
    }));

  const todayItems = learnables
    .map((item) => ({ item, tally: stats.todayChars[item.char] }))
    .filter((row) => row.tally)
    .sort((a, b) => missedCount(b.tally) - missedCount(a.tally))
    .map(({ item, tally }) => ({
      item,
      note: `${tally.correct}○ ${missedCount(tally)}✕`,
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
          <ItemList items={todayItems} emptyText="오늘 푼 것이 아직 없습니다." />
        </ExpandableStat>

        <ExpandableStat
          id="mastered-panel"
          value={mastered.length}
          suffix={`/${deck.length}`}
          label={`마스터한 ${unit}`}
          expanded={expanded === 'mastered'}
          onToggle={() => toggle('mastered')}
        >
          <ItemList
            items={mastered.map((item) => ({ item }))}
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

      <div className="weak-list">
        <h3 className="weak-list-title">🔥 틀린 글자·단어 {mistakes.length}개</h3>
        <ItemList
          items={mistakes}
          className="mistake-list"
          emptyText="아직 틀린 게 없습니다. 이대로 가세요."
        />
      </div>

      <p className="stats-verdict">
        {stats.correct > stats.wrong + stats.idk
          ? '오 좀 치는데? 이대로 가자!'
          : '분발해라 닝겐... 갈 길이 멀다.'}
      </p>
    </div>
  );
}
