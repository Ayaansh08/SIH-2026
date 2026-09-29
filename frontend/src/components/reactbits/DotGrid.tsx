interface DotGridProps {
  dotSize?: number;
  gap?: number;
  opacity?: number;
  className?: string;
}

export const DotGrid = ({
  dotSize = 1.5,
  gap = 24,
  opacity = 0.25,
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
              fill="currentColor"
              opacity={opacity}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#survey-dot-pattern)" />
      </svg>
    </div>
  );
};
