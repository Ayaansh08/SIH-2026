import React, { useEffect, useState } from 'react';
import type { RouteResult } from '../../lib/dijkstra';
import { useLang } from '../../i18n/useLang';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface RouteFieldNotesProps {
  route: RouteResult;
}

export const RouteFieldNotes: React.FC<RouteFieldNotesProps> = ({ route }) => {
  const { lang, t } = useLang();
  const isHindi = lang === 'hi';
  const reducedMotion = useReducedMotion();

  const [visibleStepCount, setVisibleStepCount] = useState(reducedMotion ? route.steps.length : 0);

  useEffect(() => {
    if (reducedMotion) {
      setVisibleStepCount(route.steps.length);
      return;
    }

    setVisibleStepCount(0);
    const total = route.steps.length;
    let current = 0;

    const interval = setInterval(() => {
      current++;
      setVisibleStepCount(current);
      if (current >= total) {
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [route, reducedMotion]);

  if (!route.targetShelter || route.noSafeRoute) {
    return (
      <div className="bg-gauge-panel border-2 border-danger-vermilion p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-danger-vermilion">
          <svg width="20" height="20" viewBox="0 0 20 20">
            <polygon points="10,1 19,10 10,19 1,10" fill="#E2461F" stroke="#11171A" strokeWidth="1.5" />
          </svg>
          <span className="font-display font-extrabold text-2xl uppercase tracking-tight">
            NO SAFE GROUND ROUTE
          </span>
        </div>
        <p className="font-mono text-scale-13 text-offwhite leading-relaxed">
          {t('noRouteFound')}
        </p>
      </div>
    );
  }

  const shelterName = isHindi ? route.targetShelter.nameHi : route.targetShelter.name;
  const distKm = (route.totalDistanceM / 1000).toFixed(1);

  return (
    <div className="bg-gauge-room border-2 border-rule shadow-xl flex flex-col select-none">
      {/* Field Log Header Stamp */}
      <div className="bg-gauge-panel p-4 border-b-2 border-rule flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-secondary uppercase tracking-wider">
            TREKKER FIELD LOG // REFUGE DISPATCH
          </span>
          <span className="font-mono text-xs text-lichen font-bold">
            ● ROUTE VERIFIED
          </span>
        </div>

        <h3 className="font-mono font-bold text-base text-offwhite leading-tight mt-1">
          {t('nearestShelter')}: {shelterName}
        </h3>

        <div className="font-mono text-xs text-secondary flex items-center gap-4 mt-0.5">
          <span>{distKm} KM {t('totalDistance')}</span>
          <span>·</span>
          <span>~{route.totalEtaMin} MIN {t('walkEta')}</span>
          <span>·</span>
          <span>ELEV {route.targetShelter.elevation_m}M</span>
        </div>
      </div>

      {/* Warning Notice if Route Changed during flood */}
      {route.routeChanged && route.unsafeBridgeName && (
        <div className="bg-gauge-panel border-b border-rule px-4 py-2 font-mono text-xs text-watch-amber font-semibold flex items-center gap-2">
          <span>▲</span>
          <span>
            {t('routeChangedWarning', {
              name: route.unsafeBridgeName,
              min: route.unsafeAtMin ?? 30,
            })}
          </span>
        </div>
      )}

      {/* Steps Ruled List */}
      <div className="divide-y divide-rule/50 font-mono">
        {route.steps.slice(0, visibleStepCount).map((step, idx) => {
          const isLast = idx === route.steps.length - 1;
          const instruction = isHindi ? step.instructionHi : step.instructionEn;

          return (
            <div key={idx} className="p-3.5 flex items-start gap-3 hover:bg-gauge-panel/50 transition-colors">
              {/* Step Number Badge */}
              <div className="w-7 h-7 shrink-0 bg-gauge-panel border border-rule font-mono font-bold text-xs flex items-center justify-center text-offwhite">
                {step.stepNumber}
              </div>

              {/* Distance Tick Ruler SVG */}
              <div className="shrink-0 flex flex-col items-center pt-1">
                <svg width="12" height="32" viewBox="0 0 12 32">
                  <line x1="2" y1="0" x2="2" y2="32" stroke="#6E8B74" strokeWidth="1.5" />
                  <line x1="2" y1="8" x2="8" y2="8" stroke="#2E3B40" strokeWidth="1" />
                  <line x1="2" y1="16" x2="12" y2="16" stroke="#6E8B74" strokeWidth="1.5" />
                  <line x1="2" y1="24" x2="8" y2="24" stroke="#2E3B40" strokeWidth="1" />
                </svg>
              </div>

              {/* Instruction Text & Sub-details */}
              <div className="flex-1 flex flex-col gap-0.5">
                <p className={`text-sm leading-snug font-sans ${isLast ? 'font-bold text-offwhite' : 'text-offwhite/90'}`}>
                  {instruction}
                </p>
                {step.distanceM > 0 && (
                  <div className="font-mono text-xs text-secondary flex items-center gap-2 mt-0.5">
                    <span>+{step.distanceM}m</span>
                    <span>·</span>
                    <span>~{step.etaMin} min</span>
                    {step.node.elevation_m > 0 && (
                      <>
                        <span>·</span>
                        <span>{step.node.elevation_m}m AMSL</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Title Block with Big Shoulders ETA */}
      <div className="p-4 border-t-2 border-rule bg-gauge-panel flex items-center justify-between">
        <div>
          <span className="font-mono text-xs text-secondary block uppercase">
            ESTIMATED TRAVEL TIME
          </span>
          <span className="font-mono text-xs text-secondary/80">
            BASED ON 4.5 KM/H HIGHLAND PACK SPEED
          </span>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="font-display font-extrabold text-4xl text-offwhite leading-none">
            {route.totalEtaMin}
          </span>
          <span className="font-mono font-bold text-sm text-secondary">MIN</span>
        </div>
      </div>
    </div>
  );
};
