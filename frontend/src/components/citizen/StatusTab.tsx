import React, { useEffect, useState } from 'react';
import { SurveyStamp, type StatusLevel } from './SurveyStamp';
import { RulerGauge } from './RulerGauge';
import { useScenario } from '../../context/ScenarioContext';
import { useLang } from '../../i18n/useLang';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { getAnomalies } from '../../services/api';
import type { PrecursorSignal } from '../../types/contracts';

interface StatusTabProps {
  selectedLocationName: string;
  onOpenLocationPicker: () => void;
}

const CACHE_KEY = 'pravahx:cached_anomalies';

export const StatusTab: React.FC<StatusTabProps> = ({
  selectedLocationName,
  onOpenLocationPicker,
}) => {
  const { breachLikelihood, currentTimestep } = useScenario();
  const { t } = useLang();
  const reducedMotion = useReducedMotion();

  const [signals, setSignals] = useState<PrecursorSignal[]>([]);
  const [expandedSignalId, setExpandedSignalId] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [cacheTime, setCacheTime] = useState<string>('');

  useEffect(() => {
    let mounted = true;

    async function loadSignals() {
      try {
        const data = await getAnomalies();
        if (!mounted) return;
        setSignals(data);
        setIsOffline(false);
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data, timestamp: nowStr })
        );
      } catch {
        if (!mounted) return;
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setSignals(parsed.data || []);
            setCacheTime(parsed.timestamp || '');
            setIsOffline(true);
          } catch {
            // ignore
          }
        }
      }
    }

    loadSignals();
    return () => {
      mounted = false;
    };
  }, []);

  const statusLevel: StatusLevel =
    breachLikelihood >= 75 ? 'DANGER' : breachLikelihood >= 45 ? 'WATCH' : 'SAFE';

  const tickerText =
    signals.length > 0
      ? signals.map((s) => `${s.parameter.toUpperCase()} ${s.value > 0 ? '+' : ''}${s.value}${s.unit} (${s.location.toUpperCase()})`).join('  ·  ')
      : 'LAKE +0.42 m/6h  ·  RAIN 18 mm/h  ·  SEISMIC +2.4σ  ·  DISCHARGE 420 cumecs';

  return (
    <div className="flex flex-col gap-5 select-none">
      {/* Location Bar */}
      <div className="flex items-center justify-between p-3 bg-gauge-panel border-2 border-rule">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-secondary">📍 {t('location')}:</span>
          <span className="font-mono font-bold text-sm text-offwhite">{selectedLocationName}</span>
        </div>
        <button
          type="button"
          onClick={onOpenLocationPicker}
          className="min-h-[36px] px-3 py-1 border border-rule text-xs font-mono font-bold bg-gauge-room text-offwhite hover:border-lichen transition-colors"
        >
          {t('changeLocation')}
        </button>
      </div>

      {/* Offline Strip Alert if cached */}
      {isOffline && (
        <div className="bg-gauge-panel border-2 border-watch-amber p-2.5 font-mono text-xs text-offwhite flex items-center justify-between">
          <span>{t('offlineNotice', { time: cacheTime })}</span>
          <span className="text-watch-amber font-bold">● OFFLINE</span>
        </div>
      )}

      {/* STATUS Top Section: On Desktop (>=1024px) SurveyStamp and RulerGauge sit side-by-side! */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 items-center">
        <div className="w-full lg:col-span-5 flex justify-center">
          <SurveyStamp status={statusLevel} frameTimestep={currentTimestep} />
        </div>
        <div className="w-full lg:col-span-7">
          <RulerGauge value={breachLikelihood} />
        </div>
      </div>

      {/* Ticker Tape */}
      <div className="h-7 border-t border-b border-rule bg-gauge-room overflow-hidden flex items-center relative">
        <div
          className={`whitespace-nowrap font-mono text-xs text-secondary ${
            reducedMotion ? 'overflow-x-auto' : 'animate-marquee'
          }`}
          style={{
            animationDuration: '30s',
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
          }}
        >
          <span className="px-4">{tickerText}</span>
          <span className="px-4">{tickerText}</span>
        </div>
      </div>

      {/* Unusual Activity Precursor Card */}
      <div className="bg-gauge-panel border-2 border-rule p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-rule/50 pb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-offwhite">
              {t('unusualActivityTitle')}
            </span>
          </div>
          <span className="font-mono text-xs text-secondary">
            {signals.length} {t('zScore')}
          </span>
        </div>

        <p className="font-sans text-sm text-offwhite/90 leading-snug">
          {t('lakeRisingSummary')}
        </p>

        {/* Signals Accordion List */}
        <div className="divide-y divide-rule/60 font-mono text-xs mt-1">
          {signals.map((sig) => {
            const isExpanded = expandedSignalId === sig.id;
            const isAlert = sig.status === 'ALERT';
            const isWatch = sig.status === 'WATCH';
            const sigColor = isAlert ? '#E2461F' : isWatch ? '#E0A526' : '#6E8B74';

            return (
              <div key={sig.id} className="py-2.5 flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => setExpandedSignalId(isExpanded ? null : sig.id)}
                  className="w-full flex items-center justify-between text-left hover:text-offwhite transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 shrink-0"
                      style={{ backgroundColor: sigColor }}
                    />
                    <span className="font-bold text-offwhite">{sig.parameter}</span>
                    <span className="text-secondary">({sig.location})</span>
                  </div>

                  <div className="w-4 h-4 border border-rule flex items-center justify-center shrink-0">
                    <span className="text-offwhite font-bold text-xs leading-none">
                      {isExpanded ? '−' : '+'}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-2.5 bg-gauge-room border border-rule flex flex-col gap-1 text-secondary mt-1">
                    <div className="flex justify-between">
                      <span>{t('confidence')}:</span>
                      <span className="font-bold text-offwhite">{sig.confidence_pct}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('zScore')}:</span>
                      <span className="font-bold text-offwhite">
                        {sig.z_score >= 0 ? '+' : ''}{sig.z_score}σ
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('detectedAt')}:</span>
                      <span className="text-offwhite">{sig.timestamp}</span>
                    </div>
                    <div className="pt-1 mt-1 border-t border-rule/50 text-xs font-sans text-secondary leading-tight">
                      {t('whyWeFlaggedThis')}: Statistical exceedance of historical baseline during glacial melt cycle.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
