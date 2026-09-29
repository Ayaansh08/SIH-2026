import React from 'react';
import { Wordmark } from '../components/Wordmark';
import { ThemeToggle } from '../context/ThemeContext';

interface AppHeaderProps {
  routeTag?: string;
  roleChip?: string;
  actions?: React.ReactNode;
  showMeta?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  routeTag,
  roleChip,
  actions,
  showMeta = true,
}) => {
  const displayTag = roleChip || routeTag || 'HOME';

  return (
    <header className="h-14 shrink-0 border-b border-rule bg-gauge-room px-4 sm:px-6 flex items-center justify-between text-offwhite select-none relative z-30">
      {/* Left: Wordmark & Route Stamp */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Wordmark size="md" />
        <span className="survey-stamp text-xs text-lichen border-lichen font-mono">
          {displayTag}
        </span>
      </div>

      {/* Middle: Survey Meta Strip (Desktop) */}
      {showMeta && (
        <div className="hidden lg:flex items-center gap-3 font-mono text-scale-13 text-secondary">
          <span>SHEET SIH-2026-TEESTA</span>
          <span>·</span>
          <span>DATUM: WGS84</span>
          <span>·</span>
          <span className="text-lichen font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-lichen inline-block" />
            TELEMETRY ACTIVE
          </span>
        </div>
      )}

      {/* Right: Theme Toggle & Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        <ThemeToggle />
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};
