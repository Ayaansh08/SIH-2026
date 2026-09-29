interface DotGridProps {
  dotSize?: number;
  gap?: number;
  className?: string;
}

export const DotGrid = ({
  dotSize = 1.5,
  gap = 24,
  className = '',
}: DotGridProps) => {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="survey-dot-pattern"
            width={gap}
            height={gap}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={gap / 2}
              cy={gap / 2}
              r={dotSize}
              fill="#2E3B40"
              opacity="0.85"
            />
          </pattern>
          <pattern
            id="survey-major-grid"
            width={gap * 4}
            height={gap * 4}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gap * 2 - 4} ${gap * 2} L ${gap * 2 + 4} ${gap * 2} M ${gap * 2} ${gap * 2 - 4} L ${gap * 2} ${gap * 2 + 4}`}
              stroke="#7D8A80"
              strokeWidth="0.75"
              opacity="0.6"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#survey-dot-pattern)" />
        <rect width="100%" height="100%" fill="url(#survey-major-grid)" />
      </svg>
    </div>
  );
};
