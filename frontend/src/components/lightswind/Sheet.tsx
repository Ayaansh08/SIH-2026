import { useEffect, type ReactNode } from 'react';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export const Sheet = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}: SheetProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9990] flex justify-end bg-gauge-room/70">
      <div className="w-full max-w-md h-full bg-gauge-panel border-l-2 border-rule shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-rule flex items-start justify-between bg-gauge-room">
          <div>
            <div className="text-scale-11 font-mono uppercase tracking-widest text-contour">
              {subtitle || 'INSPECTION TELEMETRY DRAWER'}
            </div>
            <h2 className="text-scale-20 font-display font-bold uppercase tracking-wide text-offwhite">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 border border-rule hover:border-lichen text-contour hover:text-offwhite font-mono text-sm leading-none"
          >
            [ESC]
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>

        {/* Footer */}
        <div className="p-3 border-t border-rule bg-gauge-room text-scale-11 font-mono text-contour flex justify-between">
          <span>SURVEY SHEET REF: SIKKIM-4</span>
          <span>RECORD LOCKED</span>
        </div>
      </div>
    </div>
  );
};
