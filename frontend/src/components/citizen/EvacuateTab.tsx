import React, { useMemo, useState } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { useLang } from '../../i18n/useLang';
import { BRIDGES } from '../../data/bridges';
import { solveDijkstra, type RouteResult } from '../../lib/dijkstra';
import { RouteFieldNotes } from './RouteFieldNotes';
import { useToast } from '../lightswind/Toast';

interface EvacuateTabProps {
  userNodeId: string;
  onFireSpark: (e?: React.MouseEvent) => void;
}

export const EvacuateTab: React.FC<EvacuateTabProps> = ({ userNodeId, onFireSpark }) => {
  const { currentFrame, allFrames, breachLikelihood } = useScenario();
  const { t } = useLang();
  const { addToast } = useToast();

  const isDanger = breachLikelihood >= 75;

  const [mode, setMode] = useState<'BEFORE' | 'DURING' | 'AFTER'>(
    isDanger ? 'DURING' : 'BEFORE'
  );

  // Solve Dijkstra route
  const route: RouteResult = useMemo(() => {
    return solveDijkstra(userNodeId, mode, currentFrame, allFrames, BRIDGES);
  }, [userNodeId, mode, currentFrame, allFrames]);

  // Share Route Action
  const handleShareRoute = async (e: React.MouseEvent) => {
    onFireSpark(e);

    const summary = route.targetShelter
      ? `[Pravah-X Flood Evacuation Route]\nTarget Shelter: ${route.targetShelter.name}\nDistance: ${(route.totalDistanceM / 1000).toFixed(1)} km\nETA: ~${route.totalEtaMin} min\nSteps:\n${route.steps.map((s) => `${s.stepNumber}. ${s.instructionEn}`).join('\n')}`
      : 'No safe route found. Move to high ground immediately.';

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Pravah-X Evacuation Route',
          text: summary,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(summary);
      addToast({
        title: 'ROUTE COPIED',
        description: t('routeCopied'),
        type: 'INFO',
      });
    } catch {
      addToast({
        title: 'DISPATCH READY',
        description: summary.slice(0, 80) + '...',
        type: 'INFO',
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 select-none">
      {/* 3 State Mode Tabs (BEFORE / DURING / AFTER) */}
      <div className="grid grid-cols-3 border-2 border-rule bg-gauge-room">
        {(['BEFORE', 'DURING', 'AFTER'] as const).map((m) => {
          const isSelected = mode === m;
          const label = m === 'BEFORE' ? t('tabBefore') : m === 'DURING' ? t('tabDuring') : t('tabAfter');

          return (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`min-h-[44px] py-2 px-1 font-mono text-xs font-bold border-r last:border-r-0 border-rule transition-colors flex flex-col items-center justify-center ${
                isSelected
                  ? 'bg-gauge-panel text-offwhite border-b-2 border-b-lichen'
                  : 'bg-gauge-room text-secondary hover:bg-gauge-panel hover:text-offwhite'
              }`}
            >
              <span className="text-center">{label}</span>
            </button>
          );
        })}
      </div>

      {/* SVG Route Visualization Card */}
      <div className="bg-gauge-panel border-2 border-rule p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between font-mono text-xs text-secondary">
          <span className="font-bold text-offwhite">PATHWAY SCHEMATIC</span>
          <span>{route.steps.length} WAYPOINTS</span>
        </div>

        {/* Dynamic Route SVG Map Canvas */}
        <div className="relative w-full h-32 bg-gauge-room border border-rule overflow-hidden flex items-center justify-center p-2">
          {route.pathCoords.length >= 2 ? (
            <svg viewBox="0 0 340 100" className="w-full h-full overflow-visible">
              {/* Background Grid Lines */}
              <line x1="0" y1="50" x2="340" y2="50" stroke="#2E3B40" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6" />
              <line x1="170" y1="0" x2="170" y2="100" stroke="#2E3B40" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6" />

              {/* Inundation Corridor Background Zone */}
              {mode === 'DURING' && (
                <rect x="130" y="20" width="80" height="60" fill="#E2461F" fillOpacity="0.18" stroke="#E2461F" strokeWidth="1" strokeDasharray="2 2" />
              )}

              {/* Waypoint Polyline */}
              {(() => {
                const count = route.pathCoords.length;
                const points = route.pathCoords.map((_, idx) => {
                  const x = 30 + (idx / (count - 1)) * 280;
                  const y = 80 - Math.sin((idx / (count - 1)) * Math.PI) * 50;
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                }).join(' ');

                return (
                  <>
                    <polyline
                      points={points}
                      fill="none"
                      stroke="#6E8B74"
                      strokeWidth="3"
                      strokeDasharray="8 6"
                      className="transition-all duration-700"
                    />
                    {route.pathCoords.map((_, idx) => {
                      const x = 30 + (idx / (count - 1)) * 280;
                      const y = 80 - Math.sin((idx / (count - 1)) * Math.PI) * 50;
                      const isEnd = idx === count - 1;
                      const isStart = idx === 0;

                      return (
                        <g key={idx}>
                          <rect
                            x={x - (isEnd || isStart ? 6 : 4)}
                            y={y - (isEnd || isStart ? 6 : 4)}
                            width={isEnd || isStart ? 12 : 8}
                            height={isEnd || isStart ? 12 : 8}
                            fill={isEnd ? '#6E8B74' : isStart ? '#E6E2D3' : '#1A2226'}
                            stroke={isEnd ? '#6E8B74' : isStart ? '#E6E2D3' : '#2E3B40'}
                            strokeWidth="1.5"
                          />
                          <text
                            x={x}
                            y={y - 10}
                            fontFamily="IBM Plex Mono"
                            fontSize="9"
                            fontWeight="600"
                            fill="#E6E2D3"
                            textAnchor="middle"
                          >
                            {isStart ? 'START' : isEnd ? 'SHELTER' : `0${idx + 1}`}
                          </text>
                        </g>
                      );
                    })}
                  </>
                );
              })()}

              {/* Blocked Segments in Vermilion with ✕ */}
              {route.blockedSegments.map((_, i) => (
                <g key={i}>
                  <line x1="140" y1="40" x2="200" y2="60" stroke="#E2461F" strokeWidth="3" />
                  <text x="170" y="55" fill="#E2461F" fontSize="14" fontWeight="bold" textAnchor="middle">✕</text>
                </g>
              ))}
            </svg>
          ) : (
            <div className="font-mono text-xs text-secondary">
              {t('noRouteFound')}
            </div>
          )}
        </div>
      </div>

      {/* Bespoke RouteFieldNotes Trekker Log */}
      <RouteFieldNotes route={route} />

      {/* Action Buttons: Share Route + Call 112 */}
      <div className="flex flex-col gap-2.5 pt-2">
        <button
          type="button"
          onClick={handleShareRoute}
          className="min-h-[44px] w-full py-3 px-4 bg-gauge-panel border-2 border-rule text-offwhite font-mono font-bold text-sm uppercase tracking-wider hover:border-lichen transition-colors flex items-center justify-center gap-2"
        >
          <span>📤</span>
          <span>{t('shareRoute')}</span>
        </button>

        {/* 56px Tall Call 112 Button */}
        <a
          href="tel:112"
          className="h-14 w-full px-4 border-2 border-danger-vermilion bg-danger-vermilion text-offwhite font-mono font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-danger-vermilion/90 transition-colors shadow-lg"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <polygon points="9,1 17,9 9,17 1,9" fill="#11171A" stroke="#E6E2D3" strokeWidth="1.5" />
          </svg>
          <span>{t('call112')}</span>
        </a>
      </div>
    </div>
  );
};
