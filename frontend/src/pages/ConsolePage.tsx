import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { BreachScenarioParams, Station } from '../types/contracts';
import {
  GAUGE_STATIONS,
  MOCK_FRAMES,
  MOCK_HYDROGRAPHS,
  PRECURSOR_SIGNALS,
  SCENARIOS,
  SCENARIO_BREACH_LIKELIHOOD,
} from '../data/mock';
import { SurveyMap } from '../components/map/SurveyMap';
import { ScenarioSpecTable } from '../components/bespoke/ScenarioSpecTable';
import { HydrographChart } from '../components/bespoke/HydrographChart';
import { GaugeLedger } from '../components/bespoke/GaugeLedger';
import { PrecursorFeed } from '../components/bespoke/PrecursorFeed';
import { BreachLikelihoodDial } from '../components/bespoke/BreachLikelihoodDial';
import { StripChartScrubber } from '../components/bespoke/StripChartScrubber';
import { Command } from '../components/lightswind/Command';
import { Sheet } from '../components/lightswind/Sheet';
import { useToast } from '../components/lightswind/Toast';

export const ConsolePage = () => {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [currentTimestep, setCurrentTimestep] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const { addToast } = useToast();

  const currentScenario: BreachScenarioParams = SCENARIOS[scenarioIndex] || SCENARIOS[0];
  const frames = MOCK_FRAMES[currentScenario.scenario_id] || [];
  const currentFrame =
    frames.find((f) => f.timestep_minutes === currentTimestep) ||
    frames[Math.min(frames.length - 1, Math.floor(currentTimestep / 15))];

  const currentHydrograph = MOCK_HYDROGRAPHS[currentScenario.scenario_id] || null;
  const currentLikelihood = SCENARIO_BREACH_LIKELIHOOD[currentScenario.scenario_id] || 65;

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTimestep((prev) => {
        const next = prev >= 120 ? 0 : prev + 15;
        GAUGE_STATIONS.forEach((stn) => {
          const arr = stn.arrival_times[currentScenario.scenario_id] ?? 0;
          if (next >= arr && prev < arr && arr > 0) {
            addToast({
              title: `FLOOD FRONT AT ${stn.name.toUpperCase()}`,
              description: `Hydrodynamic crest reached KM ${stn.river_chainage_km} at T+${next}m. Danger stage breached.`,
              type: 'ALERT',
            });
          }
        });
        return next;
      });
    }, 1400);
    return () => clearInterval(interval);
  }, [isPlaying, currentScenario.scenario_id, addToast]);

  return (
    <div className="relative min-h-screen w-full bg-gauge-room text-offwhite gauge-grain flex flex-col justify-between overflow-x-hidden select-none">
      {/* Top Bar Header */}
      <header className="h-10 border-b border-rule bg-gauge-room px-4 flex items-center justify-between text-scale-11 font-mono">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-display font-extrabold text-scale-20 text-offwhite hover:text-lichen leading-none">
            TEESTAWATCH
          </Link>
          <span className="text-contour">│</span>
          <span className="survey-stamp text-lichen">GAUGE ROOM CONSOLE</span>
          <span className="hidden sm:inline text-contour">SURVEY REGION 4 · SIKKIM / NORTH BENGAL</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCommandOpen(true)}
            className="px-2 py-0.5 border border-rule hover:border-lichen text-contour hover:text-offwhite text-[10px] flex items-center gap-1.5"
          >
            <span>SEARCH [CMD+K]</span>
            <span className="text-lichen">┼</span>
          </button>
          <Link to="/citizen" className="px-2 py-0.5 bg-[#DDD6C0] text-[#1E2723] font-medium text-[10px] hover:bg-[#E9E4D3]">
            CITIZEN LAYER (P2)
          </Link>
        </div>
      </header>

      {/* Main Body: 48px Rail + 12-Column Grid */}
      <div className="flex-1 flex">
        <aside className="w-12 bg-gauge-room border-r border-rule flex flex-col justify-between py-4 items-center shrink-0">
          <div className="flex flex-col items-center gap-8">
            <span className="font-mono text-scale-13 text-contour">┼</span>
            <div className="rotate-180 [writing-mode:vertical-rl] font-mono text-[10px] tracking-widest text-contour uppercase">
              GRID REF: 27°N 88°E
            </div>
            <div className="rotate-180 [writing-mode:vertical-rl] font-mono text-[10px] tracking-widest text-lichen uppercase font-semibold">
              SIH 2026 // SURVEY 4
            </div>
          </div>
          <div className="flex flex-col items-center gap-6">
            <div className="rotate-180 [writing-mode:vertical-rl] font-mono text-[10px] tracking-widest text-contour uppercase">
              ACTIVE SENSORS (6/6)
            </div>
            <span className="font-mono text-scale-13 text-contour">┼</span>
          </div>
        </aside>

        {/* 12-Column Asymmetric Workspace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 relative">
          <div className="lg:col-span-8 relative h-[650px] lg:h-auto min-h-[500px] flex flex-col">
            <SurveyMap
              frame={currentFrame}
              stations={GAUGE_STATIONS}
              selectedStationId={selectedStation?.id}
              onSelectStation={(stn) => setSelectedStation(stn)}
              className="flex-1 w-full"
            />
          </div>

          {/* Grid Break: Breach Likelihood Dial overlapping the map/data boundary */}
          <div className="hidden lg:block absolute top-6 right-[33.33%] translate-x-1/2 z-[800]">
            <BreachLikelihoodDial
              value={currentLikelihood}
              scenarioName={`RUN #${scenarioIndex + 1} (${currentScenario.valley_confinement_class})`}
            />
          </div>

          {/* Right Data Column: 4 cols */}
          <div className="lg:col-span-4 bg-gauge-panel border-l border-rule flex flex-col gap-3 p-3 overflow-y-auto max-h-[calc(100vh-140px)]">
            <div className="block lg:hidden">
              <BreachLikelihoodDial
                value={currentLikelihood}
                scenarioName={`RUN #${scenarioIndex + 1} (${currentScenario.valley_confinement_class})`}
              />
            </div>

            <ScenarioSpecTable
              scenarios={SCENARIOS}
              selectedIndex={scenarioIndex}
              onSelectIndex={(idx) => {
                setScenarioIndex(idx);
                addToast({
                  title: `SCENARIO CHANGED: RUN #${idx + 1}`,
                  description: `Loaded ${SCENARIOS[idx].terrain_slope_class} (${SCENARIOS[idx].valley_confinement_class}) parameters.`,
                  type: 'INFO',
                });
              }}
            />

            <HydrographChart hydrograph={currentHydrograph} currentTimestep={currentTimestep} />

            <GaugeLedger
              stations={GAUGE_STATIONS}
              selectedScenarioId={currentScenario.scenario_id}
              currentTimestep={currentTimestep}
              selectedStationId={selectedStation?.id}
              onSelectStation={(stn) => setSelectedStation(stn)}
            />

            <PrecursorFeed signals={PRECURSOR_SIGNALS} />
          </div>
        </div>
      </div>

      <StripChartScrubber
        currentTimestep={currentTimestep}
        onTimestepChange={(t) => setCurrentTimestep(t)}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((p) => !p)}
      />

      <Command
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        stations={GAUGE_STATIONS}
        onSelectStation={(stn) => {
          setSelectedStation(stn);
          addToast({
            title: `TARGETED GAUGE: ${stn.name.toUpperCase()}`,
            description: `Chainage KM ${stn.river_chainage_km}. Current stage: ${stn.current_stage_m}m.`,
            type: 'INFO',
          });
        }}
        onSelectScenario={(idx) => setScenarioIndex(idx)}
      />

      <Sheet
        isOpen={!!selectedStation}
        onClose={() => setSelectedStation(null)}
        title={selectedStation?.name || ''}
        subtitle={`STATION REF: ${selectedStation?.id || ''}`}
      >
        {selectedStation && (
          <div className="flex flex-col gap-4 font-mono text-scale-13">
            <div className="grid grid-cols-2 gap-2 p-3 bg-gauge-room border border-rule text-scale-11">
              <div>
                <span className="text-contour block">CHAINAGE:</span>
                <span className="text-offwhite font-bold">KM {selectedStation.river_chainage_km}</span>
              </div>
              <div>
                <span className="text-contour block">COORDINATES:</span>
                <span className="text-offwhite">{selectedStation.lat.toFixed(3)}°N {selectedStation.lon.toFixed(3)}°E</span>
              </div>
              <div>
                <span className="text-contour block">WARNING THRESHOLD:</span>
                <span className="text-watch-amber">{selectedStation.warning_stage_m} m</span>
              </div>
              <div>
                <span className="text-contour block">DANGER THRESHOLD:</span>
                <span className="text-danger-vermilion">{selectedStation.danger_stage_m} m</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-scale-11 text-contour uppercase">Arrival Schedule By Scenario:</span>
              <div className="flex flex-col gap-1 text-scale-11">
                {SCENARIOS.map((sc, i) => (
                  <div key={sc.scenario_id} className="flex justify-between p-2 bg-gauge-room border border-rule">
                    <span>RUN #{i + 1} ({sc.valley_confinement_class})</span>
                    <span className="text-offwhite font-bold">T+{selectedStation.arrival_times[sc.scenario_id] ?? 0}m</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-gauge-room border border-rule flex flex-col gap-2">
              <span className="text-scale-11 text-contour uppercase">Telemetry Status Stamp</span>
              <span className="survey-stamp text-danger-vermilion w-fit">CURRENT STATUS: {selectedStation.status}</span>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
};
