import type { Hydrograph } from '../../types/contracts';

interface HydrographChartProps {
  hydrograph: Hydrograph | null;
  currentTimestep: number;
  className?: string;
}

export const HydrographChart = ({
  hydrograph,
  currentTimestep,
  className = '',
}: HydrographChartProps) => {
  if (!hydrograph || hydrograph.time_series.length === 0) {
    return (
      <div className="p-4 text-scale-11 font-mono text-contour bg-gauge-panel border border-rule">
        NO HYDROGRAPH DATA LOADED
      </div>
    );
  }

  const series = hydrograph.time_series;
  const maxTime = Math.max(...series.map((p) => p[0]), 120);
  const maxQ = Math.max(...series.map((p) => p[1]), 500);

  const width = 360;
  const height = 110;
  const padLeft = 38;
  const padRight = 14;
  const padTop = 14;
  const padBottom = 22;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  // Scale functions
  const getX = (t: number) => padLeft + (t / maxTime) * chartW;
  const getY = (q: number) => padTop + chartH - (q / maxQ) * chartH;

  // Find peak
  let peakPoint = series[0];
  series.forEach((pt) => {
    if (pt[1] > peakPoint[1]) peakPoint = pt;
  });

  const pathD = series
    .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(pt[0]).toFixed(1)} ${getY(pt[1]).toFixed(1)}`)
    .join(' ');

  const areaD = `${pathD} L ${getX(series[series.length - 1][0]).toFixed(1)} ${getY(0).toFixed(1)} L ${getX(series[0][0]).toFixed(1)} ${getY(0).toFixed(1)} Z`;

  const cursorX = getX(Math.min(maxTime, currentTimestep));

  return (
    <div className={`flex flex-col bg-gauge-panel border border-rule p-2.5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between text-scale-11 font-mono border-b border-rule pb-1 mb-1">
        <span className="text-offwhite font-medium">DISCHARGE HYDROGRAPH</span>
        <span className="text-[10px] text-contour">PEAK {peakPoint[1].toLocaleString()} CUMECS</span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
      >
        {/* Horizontal gridlines */}
        {[0, 0.33, 0.66, 1].map((ratio, i) => {
          const y = padTop + chartH * (1 - ratio);
          const qVal = Math.round(maxQ * ratio);
          return (
            <g key={i}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="#2E3B40"
                strokeWidth="0.75"
              />
              <text
                x={padLeft - 4}
                y={y + 3}
                fill="#7D8A80"
                fontSize="8"
                fontFamily="IBM Plex Mono"
                textAnchor="end"
              >
                {qVal}
              </text>
            </g>
          );
        })}

        {/* Fill under hydrograph curve in subtle lichen tint */}
        <path d={areaD} fill="#6E8B74" fillOpacity="0.12" />

        {/* Discharge curve line in lichen */}
        <path
          d={pathD}
          fill="none"
          stroke="#6E8B74"
          strokeWidth="1.75"
          strokeLinecap="square"
        />

        {/* Peak point marker */}
        <circle
          cx={getX(peakPoint[0])}
          cy={getY(peakPoint[1])}
          r="3"
          fill="#11171A"
          stroke="#E0A526"
          strokeWidth="1.5"
        />
        <text
          x={getX(peakPoint[0]) + 4}
          y={getY(peakPoint[1]) - 4}
          fill="#E0A526"
          fontSize="8"
          fontFamily="IBM Plex Mono"
        >
          T+{peakPoint[0]}m
        </text>

        {/* Current Timestep Cursor */}
        <line
          x1={cursorX}
          y1={padTop - 4}
          x2={cursorX}
          y2={padTop + chartH}
          stroke="#E2461F"
          strokeWidth="1.25"
          strokeDasharray="2 2"
        />
        <polygon
          points={`${cursorX - 3},${padTop - 6} ${cursorX + 3},${padTop - 6} ${cursorX},${padTop}`}
          fill="#E2461F"
        />

        {/* X Axis Time Labels */}
        {[0, 30, 60, 90, 120].map((t) => (
          <text
            key={t}
            x={getX(t)}
            y={height - 4}
            fill="#7D8A80"
            fontSize="8"
            fontFamily="IBM Plex Mono"
            textAnchor="middle"
          >
            T+{t}
          </text>
        ))}
      </svg>

      <div className="flex items-center justify-between text-[9px] font-mono text-contour mt-1 pt-1 border-t border-rule/50">
        <span>X: TIMESTEP (MIN) | Y: DISCHARGE (M³/S)</span>
        <span className="text-lichen">SYNTHETIC HYDROGRAPH</span>
      </div>
    </div>
  );
};
