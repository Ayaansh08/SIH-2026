import { CountUp } from '../reactbits/CountUp';

interface BreachLikelihoodDialProps {
  value: number; // 0 - 100
  className?: string;
  scenarioName?: string;
}

export const BreachLikelihoodDial = ({
  value,
  className = '',
  scenarioName = 'ACTIVE SCENARIO',
}: BreachLikelihoodDialProps) => {
  // Value maps to -90 to +90 degrees for semicircle
  const clampedVal = Math.min(100, Math.max(0, value));
  const angle = -90 + (clampedVal / 100) * 180;

  // Color selection
  const accentColor =
    clampedVal >= 75 ? '#E2461F' : clampedVal >= 45 ? '#E0A526' : '#6E8B74';

  const statusLabel =
    clampedVal >= 75 ? 'CRITICAL BREACH THREAT' : clampedVal >= 45 ? 'ELEVATED WATCH' : 'NOMINAL CONFIDENCE';

  return (
    <div
      className={`bg-gauge-panel border-2 border-rule p-3 shadow-2xl relative flex flex-col items-center justify-between select-none ${className}`}
    >
      {/* Corner registration tick marks */}
      <span className="absolute top-1 left-1 font-mono text-[9px] text-contour">┼</span>
      <span className="absolute top-1 right-1 font-mono text-[9px] text-contour">┼</span>
      <span className="absolute bottom-1 left-1 font-mono text-[9px] text-contour">┼</span>
      <span className="absolute bottom-1 right-1 font-mono text-[9px] text-contour">┼</span>

      {/* Title */}
      <div className="w-full flex items-center justify-between text-scale-11 font-mono text-contour uppercase tracking-widest border-b border-rule pb-1 mb-1">
        <span>BREACH LIKELIHOOD</span>
        <span className="text-[10px] text-lichen">INST-GAUGE 01</span>
      </div>

      {/* SVG Semicircle Dial */}
      <div className="relative w-48 h-24 flex items-end justify-center overflow-visible mt-2">
        <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
          {/* Base Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#2E3B40"
            strokeWidth="8"
          />

          {/* Active colored arc segment */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={accentColor}
            strokeWidth="8"
            strokeDasharray="251.3"
            strokeDashoffset={251.3 - (251.3 * (clampedVal / 100))}
            className="transition-all duration-700 ease-out"
          />

          {/* Semicircle Tick Marks every 10% */}
          {Array.from({ length: 11 }).map((_, i) => {
            const tickAngle = -180 + i * 18;
            const rad = (tickAngle * Math.PI) / 180;
            const r1 = 88;
            const r2 = i % 5 === 0 ? 70 : 76;
            const x1 = 100 + r1 * Math.cos(rad);
            const y1 = 100 + r1 * Math.sin(rad);
            const x2 = 100 + r2 * Math.cos(rad);
            const y2 = 100 + r2 * Math.sin(rad);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#7D8A80"
                strokeWidth={i % 5 === 0 ? '1.5' : '1'}
              />
            );
          })}

          {/* Central Pivot & Needle */}
          <circle cx="100" cy="100" r="5" fill="#11171A" stroke="#7D8A80" strokeWidth="2" />
          <g
            style={{
              transform: `rotate(${angle}deg)`,
              transformOrigin: '100px 100px',
              transition: 'transform 800ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="28"
              stroke={accentColor}
              strokeWidth="2.5"
              strokeLinecap="square"
            />
            <polygon
              points="97,32 103,32 100,20"
              fill={accentColor}
            />
          </g>
        </svg>
      </div>

      {/* Massive Big Shoulders 88 readout */}
      <div className="flex flex-col items-center mt-[-4px]">
        <div className="flex items-baseline">
          <span
            className="font-display font-extrabold text-scale-88 tracking-tight leading-none tabular-nums"
            style={{ color: accentColor }}
          >
            <CountUp to={clampedVal} duration={0.8} />
          </span>
          <span className="font-display font-bold text-scale-28 text-contour ml-1 leading-none">
            %
          </span>
        </div>

        {/* Survey Stamp Status */}
        <div
          className="survey-stamp text-[10px] mt-1"
          style={{ color: accentColor }}
        >
          {statusLabel}
        </div>
      </div>

      {/* Subtext info */}
      <div className="w-full flex items-center justify-between text-[10px] font-mono text-contour border-t border-rule pt-1 mt-2">
        <span className="truncate max-w-[120px]">{scenarioName}</span>
        <span>BAYES-LHS EST.</span>
      </div>
    </div>
  );
};
