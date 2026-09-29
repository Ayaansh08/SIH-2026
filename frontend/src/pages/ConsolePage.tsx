import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Station } from '../types/contracts';
import {
  GAUGE_STATIONS,
  MOCK_HYDROGRAPHS,
  PRECURSOR_SIGNALS,
  SCENARIOS,
} from '../data/mock';
import { useScenario } from '../context/ScenarioContext';
import { SurveyMap } from '../components/map/SurveyMap';
import { ScenarioSpecTable } from '../components/bespoke/ScenarioSpecTable';
import { HydrographChart } from '../components/bespoke/HydrographChart';
import { GaugeLedger } from '../components/bespoke/GaugeLedger';
import { PrecursorFeed } from '../components/bespoke/PrecursorFeed';
import { BreachLikelihoodDial } from '../components/bespoke/BreachLikelihoodDial';
import { StripChartScrubber } from '../components/bespoke/StripChartScrubber';
import { Tabs } from '../components/lightswind/Tabs';
import { Command } from '../components/lightswind/Command';
import { Sheet } from '../components/lightswind/Sheet';
import { useToast } from '../components/lightswind/Toast';
import { AppHeader } from '../ui/AppHeader';

const CONSOLE_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'stations', label: 'Stations' },
  { id: 'signals', label: 'Signals' },
];

export const ConsolePage = () => {
  const {
    scenarioIndex,
    setScenarioIndex,
    currentScenario,
    currentTimestep,
    setTimestep,
    currentFrame,
    breachLikelihood,
  } = useScenario();

  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { addToast } = useToast();

  const currentHydrograph = MOCK_HYDROGRAPHS[currentScenario.scenario_id] || null;

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const next = currentTimestep >= 120 ? 0 : currentTimestep + 15;
      GAUGE_STATIONS.forEach((stn) => {
        const arr = stn.arrival_times[currentScenario.scenario_id] ?? 0;
        if (next >= arr && currentTimestep < arr && arr > 0) {
          addToast({
            title: `Flood front at ${stn.name}`,
            description: `Crest reached KM ${stn.river_chainage_km} at T+${next} min. Danger stage breached.`,
            type: 'ALERT',
          });
        }
      });
      setTimestep(next);
    }, 1400);
    return () => clearInterval(interval);
  }, [isPlaying, currentScenario.scenario_id, currentTimestep, setTimestep, addToast]);

  const scenarioName = `Scenario ${scenarioIndex + 1} · ${currentScenario.valley_confinement_class}`;

  return (
    <div className="relative h-screen w-full bg-gauge-room text-offwhite gauge-grain flex flex-col overflow-hidden select-none">
      {/* Page-corner crosses (4 outer only) */}
      <span className="corner-cross corner-cross--tl">┼</span>
      <span className="corner-cross corner-cross--tr">┼</span>
      <span className="corner-cross corner-cross--bl">┼</span>
      <span className="corner-cross corner-cross--br">┼</span>

      {/* AppHeader */}
      <AppHeader
        roleChip="Command console"
        actions={
          <>
            <button
              type="button"
              onClick={() => setIsCommandOpen(true)}
              className="px-3 py-1.5 border border-rule hover:border-lichen text-secondary hover:text-offwhite text-scale-13 font-mono transition-colors flex items-center gap-2"
            >
              <span>Search</span>
              <span className="text-secondary opacity-60">⌘K</span>
            </button>
            <Link
              to="/citizen"
              className="text-scale-13 font-sans text-secondary hover:text-offwhite transition-colors"
            >
              Citizen layer →
            </Link>
          </>
        }
      />

      {/* Two-column body: map + right panel, strictly constrained height */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Map — fills remaining width */}
        <div className="flex-1 min-w-0 h-full flex flex-col">
          <SurveyMap
            frame={currentFrame}
            stations={GAUGE_STATIONS}
            selectedStationId={selectedStation?.id}
            onSelectStation={(stn) => setSelectedStation(stn)}
            className="flex-1 h-full w-full"
          />
        </div>

        {/* Right panel — fixed width, independently scrollable */}
        <div
          className="shrink-0 flex flex-col border-l border-rule bg-gauge-panel overflow-y-auto h-full w-[440px] xl:w-[480px]"
        >
          {/* Sticky scenario dropdown */}
          <div className="sticky top-0 z-20 bg-gauge-panel border-b border-rule">
            <ScenarioSpecTable
              scenarios={SCENARIOS}
              selectedIndex={scenarioIndex}
              onSelectIndex={(idx) => {
                setScenarioIndex(idx);
                addToast({
                  title: `Scenario ${idx + 1} loaded`,
                  description: `${SCENARIOS[idx].terrain_slope_class} · ${SCENARIOS[idx].valley_confinement_class}`,
                  type: 'INFO',
                });
              }}
            />
          </div>

          {/* Tabs */}
          <Tabs tabs={CONSOLE_TABS} activeTab={activeTab} onChange={setActiveTab} />

          {/* Tab content */}
          <div className="flex flex-col gap-4 p-3 overflow-y-auto flex-1">
            {activeTab === 'overview' && (
              <>
                {/* Breach Likelihood panel */}
                <BreachLikelihoodDial
                  value={breachLikelihood}
                  signals={PRECURSOR_SIGNALS}
                  runLabel={`Run #${scenarioIndex + 1} (open)`}
                />

                {/* Next impact line */}
                <div className="px-4 py-2.5 bg-gauge-room border border-rule flex items-center justify-between">
                  <span className="text-scale-13 font-mono text-secondary">
                    Next projected front:
                  </span>
                  <span className="text-scale-13 font-mono text-watch-amber font-semibold">
                    Dikchu in ~28 min
                  </span>
                </div>

                {/* Compact hydrograph */}
                <HydrographChart hydrograph={currentHydrograph} currentTimestep={currentTimestep} />
              </>
            )}

            {activeTab === 'stations' && (
              <GaugeLedger
                stations={GAUGE_STATIONS}
                selectedScenarioId={currentScenario.scenario_id}
                currentTimestep={currentTimestep}
                selectedStationId={selectedStation?.id}
                onSelectStation={(stn) => setSelectedStation(stn)}
              />
            )}

            {activeTab === 'signals' && (
              <PrecursorFeed signals={PRECURSOR_SIGNALS} />
            )}
          </div>
        </div>
      </div>

      {/* Bottom timeline — 88px total */}
      <StripChartScrubber
        currentTimestep={currentTimestep}
        onTimestepChange={(t) => setTimestep(t)}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((p) => !p)}
        scenarioName={scenarioName}
      />

      {/* Command palette */}
      <Command
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        stations={GAUGE_STATIONS}
        onSelectStation={(stn) => {
          setSelectedStation(stn);
          addToast({
            title: `Gauge targeted: ${stn.name}`,
            description: `Chainage KM ${stn.river_chainage_km}. Stage: ${stn.current_stage_m} m.`,
            type: 'INFO',
          });
        }}
        onSelectScenario={(idx) => setScenarioIndex(idx)}
      />

      {/* Station detail drawer */}
      <Sheet
        isOpen={!!selectedStation}
        onClose={() => setSelectedStation(null)}
        title={selectedStation?.name || ''}
        subtitle={selectedStation?.id || ''}
      >
        {selectedStation && (
          <div className="flex flex-col gap-4 font-mono text-scale-13">
            <div className="grid grid-cols-2 gap-3 p-4 bg-gauge-room border border-rule">
              <div>
                <span className="text-secondary block text-scale-13 mb-1">Chainage</span>
                <span className="text-offwhite font-medium">KM {selectedStation.river_chainage_km}</span>
              </div>
              <div>
                <span className="text-secondary block text-scale-13 mb-1">Coordinates</span>
                <span className="text-offwhite">{selectedStation.lat.toFixed(3)}°N {selectedStation.lon.toFixed(3)}°E</span>
              </div>
              <div>
                <span className="text-secondary block text-scale-13 mb-1">Warning threshold</span>
                <span className="text-watch-amber">{selectedStation.warning_stage_m} m</span>
              </div>
              <div>
                <span className="text-secondary block text-scale-13 mb-1">Danger threshold</span>
                <span className="text-danger-vermilion">{selectedStation.danger_stage_m} m</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-secondary text-scale-13 mb-1">Arrival schedule by scenario</span>
              {SCENARIOS.map((sc, i) => (
                <div key={sc.scenario_id} className="flex justify-between p-3 bg-gauge-room border border-rule">
                  <span className="text-secondary">Run #{i + 1} · {sc.valley_confinement_class}</span>
                  <span className="text-offwhite font-medium tabular-nums">T+{selectedStation.arrival_times[sc.scenario_id] ?? 0} min</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
};
