// SectionLabel — 13px sentence case text-secondary
interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}
export const SectionLabel = ({ children, className = '' }: SectionLabelProps) => (
  <span className={`text-scale-13 text-secondary font-sans ${className}`}>
    {children}
  </span>
);

// Stamp — double border, Big Shoulders uppercase 14px
// Variants: safe | watch | alert | neutral
interface StampProps {
  variant?: 'safe' | 'watch' | 'alert' | 'neutral';
  children: React.ReactNode;
  className?: string;
}
const stampColor: Record<string, string> = {
  safe: 'text-lichen border-lichen',
  watch: 'text-watch-amber border-watch-amber',
  alert: 'text-danger-vermilion border-danger-vermilion',
  neutral: 'text-secondary border-secondary',
};
export const Stamp = ({ variant = 'neutral', children, className = '' }: StampProps) => (
  <span className={`survey-stamp ${stampColor[variant]} ${className}`}>
    {children}
  </span>
);

// Stat — Big Shoulders value + 13px label
interface StatProps {
  value: React.ReactNode;
  label: string;
  className?: string;
}
export const Stat = ({ value, label, className = '' }: StatProps) => (
  <div className={`flex flex-col ${className}`}>
    <span className="font-display font-extrabold text-scale-44 text-offwhite leading-none tracking-tight">
      {value}
    </span>
    <span className="text-scale-13 text-secondary font-mono mt-1">
      {label}
    </span>
  </div>
);
