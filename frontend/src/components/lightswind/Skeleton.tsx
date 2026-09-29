interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = 'h-4 w-full' }: SkeletonProps) => {
  return (
    <div
      className={`bg-gauge-panel/75 border border-rule/50 animate-pulse ${className}`}
      aria-hidden="true"
    />
  );
};
