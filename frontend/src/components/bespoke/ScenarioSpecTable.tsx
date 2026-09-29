import type { BreachScenarioParams } from '../../types/contracts';
import { DEMO_TAG } from '../../data/mock';

interface ScenarioSpecTableProps {
  scenarios: BreachScenarioParams[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  className?: string;
}

export const ScenarioSpecTable = ({
  scenarios,
  selectedIndex,
  onSelectIndex,
  className = '',
}: ScenarioSpecTableProps) => {
  const current = scenarios[selectedIndex] || scenarios[0];

  return (
    <div className={`flex flex-col bg-gauge-panel border border-rule ${className}`}>
      {/* Header and Scenario Selector Tabs */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-rule bg-gauge-room text-scale-11 font-mono uppercase">
        <span className="font-semibold text-offwhite">BREACH SCENARIO CONTRACT</span>
        <span className="text-[10px] text-contour">LHS SWEEP V1</span>
      </div>

      {/* 3 Scenario Button Selectors */}
      <div className="grid grid-cols-3 border-b border-rule bg-gauge-room">
        {scenarios.map((sc, idx) => {
          const isSelected = idx === selectedIndex;
          const label =
            sc.terrain_slope_class === 'braided_plains'
              ? 'BRAIDED (4.1M)'
              : sc.terrain_slope_class === 'steep'
              ? 'STEEP (0.8M)'
              : 'CONFINED (7.8M)';

          return (
            <button
              key={sc.scenario_id}
              type="button"
              onClick={() => onSelectIndex(idx)}
              className={`py-2 px-2 text-center text-scale-11 font-mono uppercase border-r last:border-r-0 border-rule transition-colors flex flex-col items-center justify-center ${
                isSelected
                  ? 'bg-gauge-panel text-offwhite border-b-2 border-b-lichen font-bold'
                  : 'text-contour hover:text-offwhite hover:bg-gauge-panel/40'
              }`}
            >
              <span className="text-[10px] text-lichen">RUN #{idx + 1}</span>
              <span className="truncate w-full">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Specification Parameter Table */}
      <div className="p-3 flex flex-col gap-1.5 text-scale-11 font-mono">
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 py-1 border-b border-rule/50">
          <span className="text-contour">VOLUME (V):</span>
          <span className="text-offwhite font-medium text-right tabular-nums">
            {current.volume_m3.toLocaleString()} m³
          </span>

          <span className="text-contour">BREACH WIDTH (Bw):</span>
          <span className="text-offwhite font-medium text-right tabular-nums">
            {current.breach_width_m.toFixed(2)} m
          </span>

          <span className="text-contour">FORMATION TIME (tf):</span>
          <span className="text-offwhite font-medium text-right tabular-nums">
            {current.breach_formation_time_min.toFixed(2)} min
          </span>

          <span className="text-contour">ROUGHNESS (n):</span>
          <span className="text-offwhite font-medium text-right tabular-nums">
            {current.mannings_n.toFixed(4)}
          </span>

          <span className="text-contour">SLOPE CLASS:</span>
          <span className="text-lichen font-medium text-right uppercase">
            {current.terrain_slope_class}
          </span>

          <span className="text-contour">CONFINEMENT:</span>
          <span className="text-lichen font-medium text-right uppercase">
            {current.valley_confinement_class}
          </span>
        </div>

        {/* System IDs */}
        <div className="flex flex-col gap-0.5 pt-1 text-[10px] text-contour">
          <div className="flex justify-between">
            <span>BASIN:</span>
            <span className="text-offwhite font-mono">{current.basin_id}</span>
          </div>
          <div className="flex justify-between">
            <span>SCENARIO UUID:</span>
            <span className="text-offwhite font-mono truncate max-w-[170px]" title={current.scenario_id}>
              {current.scenario_id}
            </span>
          </div>
        </div>

        {/* Demo Tag */}
        <div className="mt-1 pt-1.5 border-t border-rule/50 flex justify-between items-center text-[9px] text-contour">
          <span>{DEMO_TAG}</span>
          <span className="text-lichen font-bold">CALIBRATED</span>
        </div>
      </div>
    </div>
  );
};
