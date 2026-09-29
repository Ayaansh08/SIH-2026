import type { Station } from '../../types/contracts';

interface GaugeLedgerProps {
  stations: Station[];
  selectedScenarioId: string;
  currentTimestep: number;
  selectedStationId?: string;
  onSelectStation: (station: Station) => void;
}

export const GaugeLedger = ({
  stations,
  selectedScenarioId,
  currentTimestep,
  selectedStationId,
  onSelectStation,
}: GaugeLedgerProps) => {
  return (
    <div className="flex flex-col bg-gauge-panel border border-rule">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-rule bg-gauge-room text-scale-11 font-mono uppercase text-contour">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-offwhite">CORRIDOR GAUGE LEDGER</span>
          <span className="text-[10px] text-lichen">REALTIME TELEMETRY</span>
        </div>
        <span>6 GAUGES ONLINE</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-scale-13 font-mono">
          <thead>
            <tr className="border-b border-rule text-[10px] text-contour uppercase bg-gauge-panel">
              <th className="py-1.5 px-2 font-normal">STN / CHAINAGE</th>
              <th className="py-1.5 px-2 font-normal">STAGE (M)</th>
              <th className="py-1.5 px-2 font-normal">SPARKLINE</th>
              <th className="py-1.5 px-2 font-normal">ETA (MIN)</th>
              <th className="py-1.5 px-2 font-normal text-right">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule/60">
            {stations.map((stn) => {
              const arrivalTime = stn.arrival_times[selectedScenarioId] ?? 0;
              const hasArrived = currentTimestep >= arrivalTime;
              const isSelected = selectedStationId === stn.id;

              // Sparkline SVG coordinates
              const minVal = Math.min(...stn.history);
              const maxVal = Math.max(...stn.history, stn.danger_stage_m);
              const range = maxVal - minVal || 1;
              const width = 48;
              const height = 16;
              const points = stn.history
                .map((val, idx) => {
                  const x = (idx / (stn.history.length - 1)) * width;
                  const y = height - ((val - minVal) / range) * (height - 2) - 1;
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                })
                .join(' ');

              // Status stamp coloring
              const isDanger = hasArrived || stn.status === 'ALERT' || stn.status === 'INUNDATED';
              const isWatch = stn.status === 'WATCH';
              const stampClass = isDanger
                ? 'text-danger-vermilion border-danger-vermilion'
                : isWatch
                ? 'text-watch-amber border-watch-amber'
                : 'text-lichen border-lichen';

              const activeStatus = hasArrived ? 'INUNDATED' : stn.status;

              return (
                <tr
                  key={stn.id}
                  onClick={() => onSelectStation(stn)}
                  className={`cursor-pointer transition-colors hover:bg-gauge-room/70 ${
                    isSelected ? 'bg-gauge-room border-l-2 border-l-lichen' : ''
                  }`}
                >
                  {/* Station and Chainage */}
                  <td className="py-2 px-2 text-scale-11">
                    <div className="text-offwhite font-medium truncate max-w-[110px]">
                      {stn.name}
                    </div>
                    <div className="text-contour text-[10px]">
                      KM {stn.river_chainage_km.toString().padStart(3, '0')} · [{stn.id}]
                    </div>
                  </td>

                  {/* Stage readout */}
                  <td className="py-2 px-2 tabular-nums">
                    <div className="text-scale-13 font-semibold text-offwhite">
                      {stn.current_stage_m.toFixed(1)}
                      <span className="text-[10px] text-contour font-normal ml-0.5">m</span>
                    </div>
                    <div className="text-[10px] text-contour">
                      WARN {stn.warning_stage_m.toFixed(1)}m
                    </div>
                  </td>

                  {/* Tiny SVG sparkline */}
                  <td className="py-2 px-2">
                    <svg
                      width={width}
                      height={height}
                      className="overflow-visible"
                    >
                      <polyline
                        points={points}
                        fill="none"
                        stroke={isDanger ? '#E2461F' : isWatch ? '#E0A526' : '#6E8B74'}
                        strokeWidth="1.25"
                      />
                      {/* Danger stage threshold line */}
                      <line
                        x1="0"
                        y1={height - ((stn.danger_stage_m - minVal) / range) * height}
                        x2={width}
                        y2={height - ((stn.danger_stage_m - minVal) / range) * height}
                        stroke="#E2461F"
                        strokeWidth="0.75"
                        strokeDasharray="2 2"
                        opacity="0.5"
                      />
                    </svg>
                  </td>

                  {/* Arrival time in Big Shoulders */}
                  <td className="py-2 px-2">
                    <span className="font-display font-extrabold text-scale-20 text-offwhite leading-none">
                      T+{arrivalTime}
                    </span>
                    <span className="text-[9px] text-contour ml-0.5">m</span>
                  </td>

                  {/* Status Survey Stamp */}
                  <td className="py-2 px-2 text-right">
                    <span className={`survey-stamp ${stampClass}`}>
                      {activeStatus}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
