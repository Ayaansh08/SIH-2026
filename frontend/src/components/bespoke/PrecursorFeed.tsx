import type { PrecursorSignal } from '../../types/contracts';

interface PrecursorFeedProps {
  signals: PrecursorSignal[];
  className?: string;
}

export const PrecursorFeed = ({ signals, className = '' }: PrecursorFeedProps) => {
  return (
    <div className={`flex flex-col bg-gauge-panel border border-rule ${className}`}>
      {/* Title */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-rule bg-gauge-room text-scale-11 font-mono uppercase text-contour">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-offwhite">PRECURSOR ANOMALY FEED</span>
          <span className="text-[10px] text-danger-vermilion animate-pulse">● LIVE SENSORS</span>
        </div>
        <span>BAYES PRIOR INPUTS</span>
      </div>

      {/* Signals List */}
      <div className="divide-y divide-rule/60 text-scale-11 font-mono">
        {signals.map((sig) => {
          const isAlert = sig.status === 'ALERT';
          const isWatch = sig.status === 'WATCH';
          const statusClass = isAlert
            ? 'text-danger-vermilion border-danger-vermilion'
            : isWatch
            ? 'text-watch-amber border-watch-amber'
            : 'text-lichen border-lichen';

          return (
            <div
              key={sig.id}
              className="p-2.5 flex flex-col gap-1 hover:bg-gauge-room/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-offwhite font-medium truncate max-w-[210px]">
                  {sig.parameter}
                </span>
                <span className={`survey-stamp ${statusClass} text-[9px]`}>
                  {sig.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-scale-13 text-offwhite font-semibold tabular-nums">
                <span>
                  {sig.value > 0 ? `+${sig.value}` : sig.value}{' '}
                  <span className="text-scale-11 font-normal text-contour">{sig.unit}</span>
                </span>
                <span className="text-scale-11 font-mono font-normal text-contour">
                  z = {sig.z_score >= 0 ? `+${sig.z_score}` : sig.z_score}σ
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-contour border-t border-rule/40 pt-1 mt-0.5">
                <span className="truncate max-w-[160px]">{sig.location}</span>
                <span>CONF: {sig.confidence_pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
