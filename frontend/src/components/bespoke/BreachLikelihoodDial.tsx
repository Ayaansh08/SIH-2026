import { CountUp } from '../reactbits/CountUp';
import { Panel } from '../../ui/Panel';
import { Stamp } from '../../ui/primitives';
import type { PrecursorSignal } from '../../types/contracts';

interface BreachLikelihoodDialProps {
  value: number; // 0 - 100
  signals?: PrecursorSignal[];
  runLabel?: string;
  className?: string;
}

export const BreachLikelihoodDial = ({
  value,
  signals = [],
  runLabel = 'Run #1 (open)',
  className = '',
}: BreachLikelihoodDialProps) => {
  const v = Math.min(100, Math.max(0, value));
  const angle = -90 + (v / 100) * 180;

  const accentColor = v >= 75 ? '#E2461F' : v >= 45 ? '#E0A526' : '#6E8B74';
  const stampVariant: 'alert' | 'watch' | 'safe' =
    v >= 75 ? 'alert' : v >= 45 ? 'watch' : 'safe';
  const stampLabel = v >= 75 ? 'CRITICAL THREAT' : v >= 45 ? 'ELEVATED WATCH' : 'NOMINAL';

  const top3 = [...signals].sort((a, b) => Math.abs(b.z_score) - Math.abs(a.z_score)).slice(0, 3);

  const cx = 110;
  const cy = 110;
  const r = 70;
  const arcStroke = 8;
  const ticks = [0, 25, 50, 75, 100];
  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  return (
    <Panel
      title="Breach likelihood"
      meta="Gauge 01"
      className={className}
      footer={
        <>
          <span>{runLabel}</span>
          <span>Bayes-LHS estimate</span>
        </>
      }
    >
      <div className="p-4 flex flex-col gap-4">
        {/* Top: Dial & Main Metric Readout */}
        <div className="flex items-center justify-between gap-4">
          <div className="shrink-0">
            <svg viewBox="0 0 220 125" width="180" height="102" className="overflow-visible select-none">
              <path
                d={arcPath}
                fill="none"
                stroke="#2E3B40"
                strokeWidth={arcStroke}
                strokeLinecap="butt"
              />
              <path
                d={arcPath}
                fill="none"
                stroke={accentColor}
                strokeWidth={arcStroke}
                strokeLinecap="butt"
                strokeDasharray={`${Math.PI * r}`}
                strokeDashoffset={(Math.PI * r) * (1 - v / 100)}
                className="transition-all duration-700 ease-out"
              />

              {ticks.map((pct) => {
                const deg = -180 + (pct / 100) * 180;
                const rad = (deg * Math.PI) / 180;
                const or = r + arcStroke / 2;
                const ir = r - arcStroke / 2;
                const tx1 = cx + or * Math.cos(rad);
                const ty1 = cy + or * Math.sin(rad);
                const tx2 = cx + (ir - 5) * Math.cos(rad);
                const ty2 = cy + (ir - 5) * Math.sin(rad);
                const lr = r + arcStroke / 2 + 12;
                const lx = cx + lr * Math.cos(rad);
                const ly = cy + lr * Math.sin(rad);
                return (
                  <g key={pct}>
                    <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="#7D8A80" strokeWidth="1" />
                    <text
                      x={lx}
                      y={ly + 3}
                      fill="#A3AEA5"
                      fontSize="10"
                      fontFamily="IBM Plex Mono"
                      textAnchor="middle"
                    >
                      {pct}
                    </text>
                  </g>
                );
              })}

              <circle cx={cx} cy={cy} r="4" fill="#11171A" stroke="#7D8A80" strokeWidth="1.5" />

              <g
                style={{
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: `${cx}px ${cy}px`,
                  transition: 'transform 800ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <line
                  x1={cx}
                  y1={cy}
                  x2={cx}
                  y2={cy - r + arcStroke + 4}
                  stroke={accentColor}
                  strokeWidth="2"
                  strokeLinecap="square"
                />
              </g>
            </svg>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div className="flex items-baseline">
              <span
                className="font-display font-extrabold leading-none tabular-nums text-scale-88"
                style={{ color: accentColor }}
              >
                <CountUp to={v} duration={0.8} />
              </span>
              <span className="font-display font-bold text-scale-28 text-secondary ml-1 leading-none">
                %
              </span>
            </div>

            <Stamp variant={stampVariant}>{stampLabel}</Stamp>
          </div>
        </div>

        {/* Bottom: Precursor drivers list */}
        {top3.length > 0 && (
          <div className="flex flex-col gap-1.5 pt-2 border-t border-rule/60">
            <span className="text-[11px] font-mono text-secondary uppercase tracking-wider">
              Primary Precursor Drivers
            </span>
            {top3.map((sig) => (
              <div key={sig.id} className="flex items-center justify-between gap-2 text-scale-13">
                <span className="font-sans text-offwhite truncate max-w-[170px]" title={sig.parameter}>
                  {sig.parameter}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-16 h-1 bg-[#2E3B40] relative overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${Math.min(100, (Math.abs(sig.z_score) / 3.5) * 100)}%`,
                        background: sig.status === 'ALERT' ? '#E2461F' : sig.status === 'WATCH' ? '#E0A526' : '#6E8B74',
                      }}
                    />
                  </div>
                  <span className="font-mono text-secondary text-scale-11 w-12 text-right">
                    {sig.z_score >= 0 ? '+' : ''}{sig.z_score}σ
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
};
