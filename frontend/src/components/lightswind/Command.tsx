import { useEffect, useState } from 'react';
import type { Station } from '../../types/contracts';

interface CommandProps {
  isOpen: boolean;
  onClose: () => void;
  stations: Station[];
  onSelectStation: (station: Station) => void;
  onSelectScenario: (index: number) => void;
}

export const Command = ({
  isOpen,
  onClose,
  stations,
  onSelectStation,
  onSelectScenario,
}: CommandProps) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredStations = stations.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-24 bg-gauge-room/80 backdrop-grayscale">
      <div className="w-full max-w-xl bg-gauge-panel border-2 border-rule shadow-2xl p-4 flex flex-col gap-3">
        {/* Header Title Block */}
        <div className="flex items-center justify-between border-b border-rule pb-2 text-scale-11 font-mono uppercase tracking-widest text-contour">
          <span>SURVEY COMMAND DISPATCH · [CMD+K]</span>
          <span>ESC TO DISMISS</span>
        </div>

        {/* Input */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="TYPE STATION NAME, CHAINAGE, OR SCENARIO..."
            className="w-full bg-gauge-room border border-rule px-3 py-2 text-scale-13 font-mono text-offwhite placeholder-contour focus:outline-none focus:border-lichen"
            autoFocus
          />
        </div>

        {/* Quick Scenarios */}
        <div className="flex flex-col gap-1">
          <div className="text-scale-11 font-mono text-contour uppercase tracking-wider">
            Quick Jump Scenarios
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onSelectScenario(idx);
                  onClose();
                }}
                className="px-2 py-1.5 bg-gauge-room border border-rule text-left text-scale-11 font-mono hover:border-lichen text-offwhite"
              >
                <span className="text-lichen font-bold mr-1">#{idx + 1}</span>
                {idx === 0 ? 'Braided' : idx === 1 ? 'Steep' : 'Confined'}
              </button>
            ))}
          </div>
        </div>

        {/* Station Results */}
        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-1">
          <div className="text-scale-11 font-mono text-contour uppercase tracking-wider">
            Corridor Hydrology Stations ({filteredStations.length})
          </div>
          {filteredStations.map((station) => (
            <button
              key={station.id}
              type="button"
              onClick={() => {
                onSelectStation(station);
                onClose();
              }}
              className="flex items-center justify-between px-3 py-2 bg-gauge-room/50 border border-rule hover:bg-gauge-room hover:border-lichen text-left text-scale-13 font-mono transition-colors"
            >
              <div>
                <span className="text-offwhite font-medium">{station.name}</span>
                <span className="text-contour text-scale-11 ml-2">[{station.id}]</span>
              </div>
              <div className="flex items-center gap-3 text-scale-11 text-contour">
                <span>KM {station.river_chainage_km}</span>
                <span
                  className={
                    station.status === 'ALERT' || station.status === 'INUNDATED'
                      ? 'text-danger-vermilion font-bold'
                      : station.status === 'WATCH'
                      ? 'text-watch-amber'
                      : 'text-lichen'
                  }
                >
                  {station.status}
                </span>
              </div>
            </button>
          ))}
          {filteredStations.length === 0 && (
            <div className="text-scale-13 font-mono text-contour py-4 text-center">
              NO MATCHING STATIONS LOCATED.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
