import { CAT_MAX } from '../lib/cat';

// 포만감과 기분을 칸으로 보여준다. 숫자보다 한눈에 들어온다.
const PIPS = 5;

const filled = (value) => Math.round((value / CAT_MAX) * PIPS);

function Meter({ icon, emptyIcon, value, label }) {
  const count = filled(value);

  return (
    <span className="cat-meter">
      <span aria-hidden="true">
        {Array.from({ length: PIPS }, (_, index) => (
          <span key={index} className={index < count ? 'pip' : 'pip empty'}>
            {index < count ? icon : emptyIcon}
          </span>
        ))}
      </span>
      <span className="sr-only">
        {label} {Math.round(value)}%
      </span>
    </span>
  );
}

export default function CatMeters({ cat }) {
  return (
    <span className="cat-meters">
      <Meter icon="♥" emptyIcon="♡" value={cat.mood} label="기분" />
      <Meter icon="🍚" emptyIcon="·" value={cat.fullness} label="포만감" />
    </span>
  );
}
