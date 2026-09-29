import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

interface StripChartScrubberProps {
  currentTimestep: number;
  onTimestepChange: (t: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  scenarioName?: string;
  maxMinutes?: number;
  className?: string;
}

export const StripChartScrubber = ({
  currentTimestep,
  onTimestepChange,
  isPlaying,
  onTogglePlay,
  scenarioName = '',
  maxMinutes = 120,
  className = '',
}: StripChartScrubberProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hintVisible, setHintVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onTimestepChange(Math.min(maxMinutes, currentTimestep + 5));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onTimestepChange(Math.max(0, currentTimestep - 5));
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        onTogglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTimestep, maxMinutes, onTimestepChange, onTogglePlay]);

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const updatePosition = (clientX: number) => {
      const offsetX = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const newT = Math.round((offsetX / rect.width) * (maxMinutes / 5)) * 5;
      onTimestepChange(Math.max(0, Math.min(maxMinutes, newT)));
    };
    updatePosition(e.clientX);

    const onPointerMove = (moveEv: PointerEvent) => updatePosition(moveEv.clientX);
    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const progressPct = (currentTimestep / maxMinutes) * 100;
  const majorMarks = [0, 30, 60, 90, 120];
  const allTicks = Array.from({ length: maxMinutes / 5 + 1 }, (_, i) => i * 5);

  return (
    <div className={`w-full bg-gauge-panel border-t border-rule flex flex-col ${className}`} style={{ height: 88 }}>
      <div className="flex items-center gap-4 px-6 border-b border-rule" style={{ height: 44 }}>
        <button
          type="button"
          onClick={onTogglePlay}
          className={`w-8 h-8 flex items-center justify-center border text-scale-15 transition-colors ${
            isPlaying
              ? 'border-danger-vermilion text-danger-vermilion bg-danger-vermilion/10'
              : 'border-rule text-offwhite hover:border-lichen'
          }`}
        >
          {isPlaying ? '■' : '▶'}
        </button>

        <span className="font-display font-extrabold text-scale-44 text-offwhite leading-none tabular-nums tracking-tight">
          T+{currentTimestep.toString().padStart(3, '0')}
          <span className="text-scale-15 font-mono text-secondary ml-1 font-normal">min</span>
        </span>

        {scenarioName && (
          <span className="text-scale-13 font-mono text-secondary ml-2 truncate">
            {scenarioName}
          </span>
        )}

        <div className="ml-auto relative">
          <button
            type="button"
            onMouseEnter={() => setHintVisible(true)}
            onMouseLeave={() => setHintVisible(false)}
            className="w-6 h-6 border border-rule text-secondary font-mono text-scale-13 flex items-center justify-center hover:border-lichen hover:text-offwhite"
          >
            ?
          </button>
          {hintVisible && (
            <div className="absolute bottom-8 right-0 bg-gauge-panel border border-rule px-3 py-2 text-scale-13 font-mono text-secondary whitespace-nowrap z-50">
              ← / → keys: step 5 min · Space: play/pause
            </div>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        className="relative flex-1 bg-gauge-room cursor-ew-resize select-none overflow-hidden"
      >
        <div
          className="absolute top-0 bottom-0 left-0 bg-lichen/10 border-r border-lichen/30 pointer-events-none transition-all duration-75"
          style={{ width: `${progressPct}%` }}
        />

        {allTicks.map((t) => {
          const isMajor = majorMarks.includes(t);
          const leftPct = (t / maxMinutes) * 100;
          return (
            <div
              key={t}
              className="absolute top-0 pointer-events-none"
              style={{ left: `${leftPct}%` }}
            >
              <div
                className="w-px"
                style={{
                  height: isMajor ? '100%' : 8,
                  background: isMajor ? '#2E3B40' : '#2E3B40',
                  opacity: isMajor ? 1 : 0.5,
                }}
              />
              {isMajor && (
                <span
                  className="absolute top-2 text-scale-12 font-mono text-secondary select-none"
                  style={{ left: 3 }}
                >
                  T+{t}
                </span>
              )}
            </div>
          );
        })}

        <div
          className="absolute top-0 bottom-0 pointer-events-none z-10 transition-all duration-75"
          style={{ left: `${progressPct}%`, transform: 'translateX(-50%)' }}
        >
          <div className="w-px h-full bg-danger-vermilion" />
        </div>
      </div>
    </div>
  );
};
