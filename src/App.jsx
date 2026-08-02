import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Flame, Settings, BarChart2, Home, Play, Volume2 } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { allCharacters } from './data';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Motivational/Humorous Messages
const correctMessages = ['오~ 천재인데?', '이걸 맞추다니!', '일본인 아니야?', '갓벽하다!', '폼 미쳤다 ㄷㄷ'];
const wrongMessages = ['아깝다! 다시 해봐', '이걸 틀려?', '정신 안 차려?', '아... 눈물이 앞을 가린다', '괜찮아 원숭이도 나무에서 떨어지지'];

export default function App() {
  const [view, setView] = useState('home');
  const [streak, setStreak] = useState(0);
  const [lastPlayed, setLastPlayed] = useState(null);
  
  // Weights for spaced repetition. Default is 1 for all.
  const [weights, setWeights] = useState(() => {
    const saved = localStorage.getItem('go2japan-weights');
    if (saved) return JSON.parse(saved);
    const initial = {};
    allCharacters.forEach(c => { initial[c.char] = 1 });
    return initial;
  });

  // Settings
  const [unknownWeight, setUnknownWeight] = useState(5);
  
  // Stats
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('go2japan-stats');
    if (saved) return JSON.parse(saved);
    return { correct: 0, wrong: 0, idk: 0, today: 0 };
  });

  // Save on change
  useEffect(() => {
    localStorage.setItem('go2japan-weights', JSON.stringify(weights));
  }, [weights]);
  
  useEffect(() => {
    localStorage.setItem('go2japan-stats', JSON.stringify(stats));
  }, [stats]);

  // Check Streak on Load
  useEffect(() => {
    const savedLastPlayed = localStorage.getItem('go2japan-last');
    const savedStreak = parseInt(localStorage.getItem('go2japan-streak') || '0', 10);
    const todayStr = new Date().toDateString();
    
    if (savedLastPlayed) {
      const lastDate = new Date(savedLastPlayed);
      const diffTime = Math.abs(new Date() - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (savedLastPlayed !== todayStr) {
        if (diffDays <= 1) {
          // Maintained streak but new day, streak is same until they play today
          setStreak(savedStreak);
        } else {
          // Lost streak
          setStreak(0);
          localStorage.setItem('go2japan-streak', '0');
        }
      } else {
        setStreak(savedStreak);
      }
    }
  }, []);

  const updateStreak = () => {
    const todayStr = new Date().toDateString();
    if (lastPlayed !== todayStr) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setLastPlayed(todayStr);
      localStorage.setItem('go2japan-streak', newStreak.toString());
      localStorage.setItem('go2japan-last', todayStr);
      
      if (newStreak % 5 === 0 || newStreak === 1) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    }
  };

  // PWA Notifications Setup
  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      if (Notification.permission === 'granted') {
        scheduleNotifications();
      }
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      scheduleNotifications();
      alert('알림 설정 완료! 아침, 점심, 저녁에 뼈 때려드릴게요.');
    }
  };

  const scheduleNotifications = () => {
    // In a real PWA this needs a push server or tricky ServiceWorker alarms.
    // For local fallback demo we just show a toast if they happen to leave the app open.
    // However, ServiceWorkers can handle periodic sync if registered.
    console.log("Notifications scheduled.");
  };

  const renderHome = () => (
    <div className="glass-panel" style={{ textAlign: 'center', marginTop: '20px' }}>
      <h1 className="header-title">Go2Japan</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>일본어 정복의 길은 멀고도 험하다...</p>
      
      <div className="mascot">👹</div>
      
      <div className="home-menu">
        <button className="btn btn-primary" onClick={() => setView('practice')}>
          <Play size={24} /> 지금 당장 연습하기
        </button>
        <button className="btn btn-secondary" onClick={() => setView('stats')}>
          <BarChart2 size={24} /> 내 처참한 실력 보기
        </button>
        <button className="btn btn-accent" onClick={() => setView('settings')}>
          <Settings size={24} /> 설정 (도망가기)
        </button>
      </div>
    </div>
  );

  return (
    <>
      <nav className="navbar">
        <div className="streak-badge">
          <Flame size={20} fill="currentColor" /> {streak}
        </div>
        {view !== 'home' && (
          <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }} onClick={() => setView('home')}>
            <Home size={28} />
          </button>
        )}
      </nav>
      
      {view === 'home' && renderHome()}
      {view === 'practice' && (
        <Practice 
          weights={weights} 
          setWeights={setWeights} 
          unknownWeight={unknownWeight}
          stats={stats}
          setStats={setStats}
          updateStreak={updateStreak}
        />
      )}
      {view === 'stats' && <Stats stats={stats} />}
      {view === 'settings' && (
        <SettingsView 
          unknownWeight={unknownWeight} 
          setUnknownWeight={setUnknownWeight} 
          requestNoti={requestNotificationPermission} 
        />
      )}
    </>
  );
}

function Practice({ weights, setWeights, unknownWeight, stats, setStats, updateStreak }) {
  const [currentQ, setCurrentQ] = useState(null);
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const generateQuestion = useCallback(() => {
    // Weighted random selection
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalWeight;
    let selectedChar = allCharacters[0];
    
    for (const char of allCharacters) {
      if (rand < weights[char.char]) {
        selectedChar = char;
        break;
      }
      rand -= weights[char.char];
    }

    // Generate 3 wrong options
    const wrongOptions = [];
    while (wrongOptions.length < 2) {
      const randomChar = allCharacters[Math.floor(Math.random() * allCharacters.length)];
      if (randomChar.char !== selectedChar.char && !wrongOptions.includes(randomChar)) {
        wrongOptions.push(randomChar);
      }
    }

    const allOptions = [selectedChar, ...wrongOptions].sort(() => Math.random() - 0.5);
    
    setCurrentQ(selectedChar);
    setOptions(allOptions);
    setFeedback(null);
  }, [weights]);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  const handleAnswer = (answerChar) => {
    if (feedback) return; // Prevent multiple clicks

    updateStreak();
    
    let isCorrect = false;
    let isIdk = answerChar === 'idk';
    
    if (!isIdk) {
      isCorrect = answerChar === currentQ.char;
    }

    const newWeights = { ...weights };
    const newStats = { ...stats, today: stats.today + 1 };

    if (isCorrect) {
      newWeights[currentQ.char] = Math.max(0.1, newWeights[currentQ.char] - 0.5); // Decrease weight, appears less
      newStats.correct += 1;
      setFeedback({ text: correctMessages[Math.floor(Math.random() * correctMessages.length)], type: 'correct' });
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    } else if (isIdk) {
      newWeights[currentQ.char] = newWeights[currentQ.char] + unknownWeight; // Increase weight
      newStats.idk += 1;
      setFeedback({ text: `정답: ${currentQ.korean} (${currentQ.romaji}) - 외워라 좀!`, type: 'wrong' });
    } else {
      newWeights[currentQ.char] = newWeights[currentQ.char] + unknownWeight; // Increase weight
      newStats.wrong += 1;
      setFeedback({ text: wrongMessages[Math.floor(Math.random() * wrongMessages.length)] + ` (정답: ${currentQ.korean})`, type: 'wrong' });
    }

    setWeights(newWeights);
    setStats(newStats);

    setTimeout(() => {
      generateQuestion();
    }, 2000);
  };

  const speak = () => {
    if (!currentQ) return;
    const utterance = new SpeechSynthesisUtterance(currentQ.char);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };

  if (!currentQ) return null;

  return (
    <div className="practice-container glass-panel">
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={speak} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
          <Volume2 size={32} />
        </button>
      </div>
      
      <div className="flashcard">
        <div className="character-display">{currentQ.char}</div>
      </div>
      
      <div className={`feedback-msg ${feedback ? feedback.type : ''}`}>
        {feedback ? feedback.text : '이건 뭘까요?'}
      </div>

      <div className="options-grid">
        {options.map((opt, i) => (
          <button 
            key={i} 
            className="option-btn" 
            onClick={() => handleAnswer(opt.char)}
            disabled={!!feedback}
          >
            {opt.korean} ({opt.romaji})
          </button>
        ))}
        <button 
          className="option-btn idk-btn" 
          onClick={() => handleAnswer('idk')}
          disabled={!!feedback}
        >
          🤷 모르겠음 (당당)
        </button>
      </div>
    </div>
  );
}

function Stats({ stats }) {
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
        borderColor: [
          'rgba(46, 213, 115, 1)',
          'rgba(255, 71, 87, 1)',
          'rgba(164, 176, 190, 1)',
        ],
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
        font: { size: 18 }
      },
    },
    scales: {
      y: {
        ticks: { color: 'white' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      },
      x: {
        ticks: { color: 'white' },
        grid: { display: false }
      }
    }
  };

  return (
    <div className="glass-panel">
      <h2 className="stats-header">📊 내 학습 리포트</h2>
      <div className="chart-container">
        <Bar data={data} options={options} />
      </div>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p style={{ fontSize: '1.2rem' }}>오늘 푼 문제: <strong style={{ color: 'var(--secondary-color)' }}>{stats.today}</strong>개</p>
        <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>
          {stats.correct > stats.wrong + stats.idk ? '오 좀 치는데? 이대로 가자!' : '분발해라 닝겐... 갈 길이 멀다.'}
        </p>
      </div>
    </div>
  );
}

function SettingsView({ unknownWeight, setUnknownWeight, requestNoti }) {
  return (
    <div className="glass-panel">
      <h2 className="stats-header">⚙️ 설정</h2>
      
      <div className="settings-group">
        <label className="settings-label">
          모르는 카드 출현 빈도 가중치: <strong>{unknownWeight}</strong> (기본 5)
        </label>
        <input 
          type="range" 
          min="1" 
          max="20" 
          value={unknownWeight} 
          onChange={(e) => setUnknownWeight(parseInt(e.target.value))}
          className="slider"
        />
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
          높을수록 '모름'이나 '오답'을 선택한 카드가 미친듯이 나옵니다.
        </p>
      </div>

      <div className="settings-group" style={{ marginTop: '40px' }}>
        <label className="settings-label">알림 설정</label>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={requestNoti}>
          🔔 아침/점심/저녁 알림 켜기
        </button>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
          PWA로 설치 시 더 원활하게 작동합니다.
        </p>
      </div>
    </div>
  );
}
