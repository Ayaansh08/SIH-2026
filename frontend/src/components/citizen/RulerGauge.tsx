import React, { useEffect, useState } from 'react';
import { useLang } from '../../i18n/useLang';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface RulerGaugeProps {
  value: number; // 0 - 100
}

export const RulerGauge: React.FC<RulerGaugeProps> = ({ value }) => {
  const { t } = useLang();
  const reducedMotion = useReducedMotion();
  const clampedVal = Math.min(100, Math.max(0, Math.round(value)));

  const [displayVal, setDisplayVal] = useState(clampedVal);

  useEffect(() => {
    setDisplayVal(clampedVal);
  }, [clampedVal]);

  // Color coding
  const colorHex =
    clampedVal >= 75 ? '#E2461F' : clampedVal >= 45 ? '#E0A526' : '#6E8B74';

  const needleLeftPct = clampedVal; // 0 to 100%

  // Digit split for mechanical odometer
  const digits = String(displayVal).padStart(2, '0').split('');

  return (
    <div className="bg-gauge-panel border-2 border-rule p-4 flex flex-col gap-3">
      {/* Title + Meta */}
      <div className="flex items-center justify-between border-b border-rule/50 pb-2">
        <span className="font-mono text-scale-13 text-offwhite font-semibold tracking-wider">
          {t('rulerGaugeTitle')}
        </span>
        <span className="font-mono text-scale-13 text-secondary">0 — 100%</span>
      </div>

      {/* Mechanical Odometer Readout + Status */}
      <div className="flex items-baseline justify-between py-1">
        <div className="flex items-baseline gap-1">
          <div className="flex items-center h-12 overflow-hidden border border-rule bg-gauge-room px-2.5">
            {digits.map((digit, idx) => (
              <div
                key={idx}
                className="w-6 h-10 font-mono font-bold text-3xl flex flex-col items-center leading-10 text-offwhite select-none overflow-hidden"
              >
                <div
                  className="transition-transform duration-500 ease-out"
                  style={{
                    transform: reducedMotion ? 'none' : `translateY(-${Number(digit) * 40}px)`,
                  }}
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <div key={n} className="h-10 flex items-center justify-center">
                      {n}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <span className="font-mono text-xl font-bold text-secondary ml-1">%</span>
          </div>

          <span
            className="font-mono text-scale-13 font-bold uppercase px-2 py-0.5 border border-current ml-2"
            style={{ color: colorHex }}
          >
            {clampedVal >= 75 ? t('statusDanger') : clampedVal >= 45 ? t('statusWatch') : t('statusSafe')}
          </span>
        </div>

        <span className="font-mono text-scale-13 text-secondary text-right max-w-[140px] leading-tight">
          {t('rulerGaugeDesc')}
        </span>
      </div>

      {/* Horizontal Survey Ruler */}
      <div className="relative pt-4 pb-2">
        {/* Needle Indicator */}
        <div
          className="absolute top-0 -ml-2 pointer-events-none transition-all duration-500 ease-out z-10 flex flex-col items-center"
          style={{
            left: `${needleLeftPct}%`,
            transition: reducedMotion ? 'none' : 'left 500ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Triangular Needle Head */}
          <div
            className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px]"
            style={{ borderTopColor: '#E6E2D3' }}
          />
          {/* Needle Stem */}
          <div className="w-[3px] h-7 bg-offwhite" />
        </div>

        {/* Ruler Base Line */}
        <div className="w-full h-7 border-t-2 border-b border-rule relative bg-gauge-room flex items-end">
          {/* Ticks every 5%, longer every 10% */}
          {Array.from({ length: 21 }).map((_, i) => {
            const pct = i * 5;
            const isMajor = pct % 10 === 0;
            const isLabeled = [0, 25, 50, 75, 100].includes(pct);

            return (
              <div
                key={pct}
                className="absolute top-0 flex flex-col items-center pointer-events-none"
                style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
              >
                <div
                  className={`w-[1px] ${
                    isMajor ? 'h-4 bg-[#7D8A80]' : 'h-2 bg-[#2E3B40]'
                  }`}
                />
                {isLabeled && (
                  <span className="font-mono text-[10px] text-secondary mt-1 select-none">
                    {pct}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
