// Panel — 1px rule border, 0 radius, padding 24, optional title row
// Title: 14px medium left, meta: 13px text-secondary right

interface PanelProps {
  title?: string;
  meta?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  minHeight?: number;
}

export const Panel = ({ title, meta, footer, children, className = '', minHeight }: PanelProps) => {
  return (
    <div
      className={`flex flex-col bg-gauge-panel border border-rule ${className}`}
      style={minHeight ? { minHeight } : undefined}
    >
      {(title || meta) && (
        <div className="flex items-center justify-between px-6 py-3 border-b border-rule gap-4">
          {title && (
            <span className="text-scale-14 font-sans font-medium text-offwhite">
              {title}
            </span>
          )}
          {meta && (
            <span className="text-scale-13 text-secondary font-mono">
              {meta}
            </span>
          )}
        </div>
      )}
      <div className="flex-1">
        {children}
      </div>
      {footer && (
        <div className="border-t border-rule px-6 py-3 flex items-center justify-between text-scale-13 text-secondary font-mono">
          {footer}
        </div>
      )}
    </div>
  );
};
