import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';

interface StripChartScrubberProps {
  currentTimestep: number;
  onTimestepChange: (t: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  maxMinutes?: number;
  className?: string;
}

export const StripChartScrubber = ({
  currentTimestep,
  onTimestepChange,
  isPlaying,
  onTogglePlay,
  maxMinutes = 120,
  className = '',
}: StripChartScrubberProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation: Left/Right arrows
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not capture if focused on input/textarea
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

    const onPointerMove = (moveEv: PointerEvent) => {
      updatePosition(moveEv.clientX);
    };
    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const progressPct = (currentTimestep / maxMinutes) * 100;

  return (
    <div className={`w-full bg-gauge-panel border-t-2 border-rule flex flex-col ${className}`}>
      {/* Control Strip Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-rule bg-gauge-room text-scale-11 font-mono uppercase text-contour">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onTogglePlay}
            className={`px-3 py-1 border text-scale-11 font-mono font-medium tracking-wider uppercase transition-colors flex items-center gap-1.5 ${
              isPlaying
                ? 'bg-danger-vermilion/20 border-danger-vermilion text-danger-vermilion'
                : 'bg-gauge-panel border-rule hover:border-lichen text-offwhite'
            }`}
          >
            <span>{isPlaying ? '■ PAUSE' : '▶ RUN'}</span>
          </button>

          <div className="flex items-center gap-1 text-[10px]">
            <span className="text-contour">TIMELINE SCRUBBER:</span>
            <span className="text-offwhite font-bold">[← / → KEYS TO STEP 5M]</span>
          </div>
        </div>

        {/* Big Shoulders Time Readout */}
        <div className="flex items-baseline gap-2">
          <span className="text-contour text-[10px]">ELAPSED TIME:</span>
          <span className="font-display font-extrabold text-scale-28 text-offwhite tracking-tight leading-none">
            T+{currentTimestep.toString().padStart(3, '0')}
          </span>
          <span className="font-mono text-scale-11 text-lichen">MIN</span>
        </div>
      </div>

      {/* Physical Strip-Chart Paper Area */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        className="relative h-14 w-full bg-[#141B1E] cursor-ew-resize select-none overflow-hidden"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, #2E3B40 1px, transparent 1px), linear-gradient(to bottom, transparent 11px, #1C2428 12px)',
          backgroundSize: '100% 12px',
        }}
      >
        {/* Strip-chart Major / Minor Vertical Time Grid Lines */}
        <div className="absolute inset-0 pointer-events-none flex justify-between px-2">
          {Array.from({ length: 25 }).map((_, idx) => {
            const min = idx * 5;
            const isMajor = min % 15 === 0;
            const leftPct = (min / maxMinutes) * 100;
            return (
              <div
                key={min}
                className="absolute top-0 bottom-0 flex flex-col justify-between"
                style={{ left: `${leftPct}%` }}
              >
                <div
                  className={`w-[1px] ${
                    isMajor ? 'h-full bg-rule' : 'h-3 bg-rule/50'
                  }`}
                />
                {isMajor && (
                  <span className="text-[9px] font-mono text-contour pl-1 pb-0.5 select-none">
                    T+{min}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Recorded Wave Shading on paper */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-lichen/10 border-r border-lichen/40 pointer-events-none transition-all duration-75"
          style={{ width: `${progressPct}%` }}
        />

        {/* Physical Stylus / Pen Cursor Line */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none z-10 transition-all duration-75"
          style={{ left: `${progressPct}%`, transform: 'translateX(-50%)' }}
        >
          {/* Pen Head Needle */}
          <div className="w-0.5 h-full bg-danger-vermilion" />
          <div className="absolute top-0 -left-1.5 w-3.5 h-3 bg-danger-vermilion text-[8px] font-mono text-gauge-room flex items-center justify-center font-bold">
            ▼
          </div>
          <div className="absolute bottom-0 -left-6 bg-gauge-panel border border-danger-vermilion px-1 py-0.2 text-[9px] font-mono text-offwhite whitespace-nowrap">
            T+{currentTimestep}m
          </div>
        </div>
      </div>
    </div>
  );
};
