import { useState } from 'react';
import InstallSection from './InstallSection';
import { SCRIPTS } from '../data';

export default function SettingsView({
  script,
  onScriptChange,
  extended,
  onExtendedChange,
  unknownWeight,
  onUnknownWeightChange,
  deckSize,
  onReset,
}) {
  const [confirmingReset, setConfirmingReset] = useState(false);

  const handleReset = () => {
    if (!confirmingReset) {
      setConfirmingReset(true);
      return;
    }
    onReset();
    setConfirmingReset(false);
  };

  return (
    <div className="glass-panel">
      <h2 className="stats-header">⚙️ 설정</h2>

      <div className="settings-group">
        <span className="settings-label" id="script-label">
          학습 범위
        </span>
        <div className="segmented" role="group" aria-labelledby="script-label">
          {SCRIPTS.map((option) => (
            <button
              key={option.id}
              className={`segmented-btn ${script === option.id ? 'active' : ''}`}
              aria-pressed={script === option.id}
              onClick={() => onScriptChange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <label className="toggle-row">
          <input
            type="checkbox"
            checked={extended}
            onChange={(event) => onExtendedChange(event.target.checked)}
          />
          <span>탁음·반탁음·요음 포함 (が, ぱ, きゃ ...)</span>
        </label>

        <p className="settings-hint">지금 출제 범위는 {deckSize}자입니다.</p>
      </div>

      <div className="settings-group">
        <label className="settings-label" htmlFor="unknown-weight">
          모르는 카드 출현 빈도 가중치: <strong>{unknownWeight}</strong> (기본 5)
        </label>
        <input
          id="unknown-weight"
          type="range"
          min="1"
          max="20"
          value={unknownWeight}
          onChange={(event) => onUnknownWeightChange(Number(event.target.value))}
          className="slider"
        />
        <p className="settings-hint">
          높을수록 &apos;모름&apos;이나 &apos;오답&apos;을 선택한 카드가 미친듯이 나옵니다.
        </p>
      </div>

      <InstallSection />

      <div className="settings-group">
        <span className="settings-label">진행 상황</span>
        <button
          className={`btn ${confirmingReset ? 'btn-primary' : 'btn-danger-outline'} btn-block`}
          onClick={handleReset}
        >
          {confirmingReset ? '진짜 지웁니다. 한 번 더 누르세요' : '🗑️ 진행 상황 초기화'}
        </button>
        {confirmingReset && (
          <button className="btn-link" onClick={() => setConfirmingReset(false)}>
            취소
          </button>
        )}
        <p className="settings-hint">
          연속 학습일, 통계, 글자별 가중치가 모두 지워집니다. 되돌릴 수 없습니다.
        </p>
      </div>
    </div>
  );
}
