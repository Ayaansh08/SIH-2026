import React from 'react';
import type { Bridge, BridgeStatusResult } from '../../lib/geo';
import { useLang } from '../../i18n/useLang';

interface BridgeNoticeProps {
  bridge: Bridge;
  statusResult: BridgeStatusResult;
  onRouteAround?: (bridge: Bridge) => void;
  isDetailed?: boolean;
}

export const BridgeNotice: React.FC<BridgeNoticeProps> = ({
  bridge,
  statusResult,
  onRouteAround,
  isDetailed = false,
}) => {
  const { lang, t } = useLang();
  const isHindi = lang === 'hi';

  const { status, unsafeFromMin } = statusResult;
  const isClosed = status === 'CLOSED';
  const isAvoid = status === 'AVOID';
  const isOpen = status === 'OPEN';

  const statusLabel =
    isClosed ? (isHindi ? 'बंद' : 'CLOSED') : isAvoid ? (isHindi ? 'बचें' : 'AVOID') : (isHindi ? 'खुला है' : 'OPEN');

  const statusColor = isClosed ? '#E2461F' : isAvoid ? '#E0A526' : '#6E8B74';

  return (
    <div className="flex flex-col border-2 border-rule bg-gauge-panel overflow-hidden">
      {/* Full-Bleed Hazard Warning Tape for CLOSED / AVOID */}
      {(isClosed || isAvoid) && (
        <div
          className="w-full h-4 border-b border-rule"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              #11171A 0px,
              #11171A 10px,
              ${statusColor} 10px,
              ${statusColor} 20px
            )`,
          }}
        />
      )}

      {/* Main Notice Body */}
      <div className="p-4 flex flex-col gap-3">
        {/* Top Header: Bridge Name & Chainage */}
        <div className="flex items-start justify-between border-b border-rule/50 pb-2">
          <div>
            <span className="font-mono text-xs text-secondary block">
              [{bridge.id}] · KM {bridge.chainage_km}
            </span>
            <h3 className="font-mono font-bold text-base text-offwhite leading-tight mt-0.5">
              {isHindi ? bridge.nameHi : bridge.name}
            </h3>
          </div>

          {/* Status Badge with hard shape */}
          <div className="flex items-center gap-2 border border-rule bg-gauge-room px-2.5 py-1 shrink-0 ml-2">
            {isClosed && (
              <svg width="14" height="14" viewBox="0 0 14 14">
                <polygon points="7,1 13,7 7,13 1,7" fill="#E2461F" stroke="#11171A" strokeWidth="1.5" />
              </svg>
            )}
            {isAvoid && (
              <svg width="14" height="14" viewBox="0 0 14 14">
                <polygon points="7,1 13,13 1,13" fill="#E0A526" stroke="#11171A" strokeWidth="1.5" />
              </svg>
            )}
            {isOpen && (
              <svg width="12" height="12" viewBox="0 0 12 12">
                <rect x="1" y="1" width="10" height="10" fill="#6E8B74" stroke="#11171A" strokeWidth="1.5" />
              </svg>
            )}
            <span
              className="font-display font-extrabold text-lg leading-none tracking-tight"
              style={{ color: statusColor }}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Status Advisory Message */}
        <div className="font-mono text-scale-13 text-offwhite/90 leading-snug">
          {isClosed && (
            <span className="text-danger-vermilion font-bold">
              {t('bridgeClosedMsg')}
            </span>
          )}
          {isAvoid && (
            <span className="text-watch-amber font-semibold">
              {t('bridgeAvoidMsg', { min: unsafeFromMin ?? 60 })}
            </span>
          )}
          {isOpen && (
            <span className="text-lichen font-semibold">
              {t('bridgeOpenMsg')}
            </span>
          )}
        </div>

        {/* Detailed Spec Table (when in modal Sheet) */}
        {isDetailed && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-rule/50 font-mono text-xs text-secondary bg-gauge-room p-2.5 border border-rule">
            <div>
              <span className="text-secondary/80 block">{t('span')}:</span>
              <span className="font-semibold text-offwhite">{bridge.span_m} METERS</span>
            </div>
            <div>
              <span className="text-secondary/80 block">{t('bridgeType')}:</span>
              <span className="font-semibold text-offwhite">{bridge.type}</span>
            </div>
            <div className="col-span-2 pt-1 border-t border-rule/50">
              <span className="text-secondary/80 block">{t('lastInspected')}:</span>
              <span className="font-semibold text-offwhite">{bridge.last_inspected}</span>
            </div>
          </div>
        )}

        {/* Action button if unsafe */}
        {(isClosed || isAvoid) && onRouteAround && (
          <button
            type="button"
            onClick={() => onRouteAround(bridge)}
            className="mt-1 w-full bg-gauge-room text-offwhite py-2.5 px-4 font-mono font-bold text-xs uppercase tracking-wider hover:border-lichen active:bg-gauge-panel transition-colors flex items-center justify-center gap-2 border border-rule"
          >
            <span>{t('routeAroundBridge')}</span>
            <span>→</span>
          </button>
        )}
      </div>

      {/* Bottom hazard tape for CLOSED */}
      {isClosed && (
        <div
          className="w-full h-2 border-t border-rule"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              #11171A 0px,
              #11171A 8px,
              #E2461F 8px,
              #E2461F 16px
            )`,
          }}
        />
      )}
    </div>
  );
};
