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
import { DEFAULT_WEIGHT, MASTERED_WEIGHT } from '../lib/storage';
import { optionLabel } from '../lib/quiz';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const WEAKEST_COUNT = 5;

export default function Stats({ stats, weights, deck }) {
  const total = stats.correct + stats.wrong + stats.idk;
  const accuracy = total === 0 ? 0 : Math.round((stats.correct / total) * 100);

  const mastered = deck.filter(
    (character) => (weights[character.char] ?? DEFAULT_WEIGHT) <= MASTERED_WEIGHT,
  ).length;

  const weakest = [...deck]
    .filter((character) => (weights[character.char] ?? DEFAULT_WEIGHT) > DEFAULT_WEIGHT)
    .sort((a, b) => (weights[b.char] ?? DEFAULT_WEIGHT) - (weights[a.char] ?? DEFAULT_WEIGHT))
    .slice(0, WEAKEST_COUNT);

  const data = {
    labels: ['정답', '오답', '모름'],
    datasets: [
      {
        label: '내 처참한 실력 분포',
        data: [stats.correct, stats.wrong, stats.idk],
        backgroundColor: [
          'rgba(46, 213, 115, 0.8)',
          'rgba(255, 71, 87, 0.8)',
          'rgba(164, 176, 190, 0.8)',
        ],
        borderColor: ['rgba(46, 213, 115, 1)', 'rgba(255, 71, 87, 1)', 'rgba(164, 176, 190, 1)'],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: '학습 통계 (동기부여 팍팍)',
        color: 'white',
        font: { size: 18 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: 'white', precision: 0 },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
      x: {
        ticks: { color: 'white' },
        grid: { display: false },
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
        <div className="stat-card">
          <span className="stat-value">{stats.today}</span>
          <span className="stat-label">오늘 푼 문제</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            {mastered}
            <small>/{deck.length}</small>
          </span>
          <span className="stat-label">마스터한 글자</span>
        </div>
      </div>

      <div
        className="chart-container"
        role="img"
        aria-label={`정답 ${stats.correct}개, 오답 ${stats.wrong}개, 모름 ${stats.idk}개`}
      >
        <Bar data={data} options={options} />
      </div>

      {weakest.length > 0 && (
        <div className="weak-list">
          <h3 className="weak-list-title">🔥 제일 약한 글자</h3>
          <ul>
            {weakest.map((character) => (
              <li key={character.char}>
                <span className="weak-char" lang="ja">
                  {character.char}
                </span>
                <span className="weak-reading">{optionLabel(character)}</span>
              </li>
            ))}
          </ul>
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
