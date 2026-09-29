import React, { createContext, useContext, useState, useMemo } from 'react';
import type { BreachScenarioParams, InundationFrame } from '../types/contracts';
import {
  SCENARIOS,
  MOCK_FRAMES,
  SCENARIO_BREACH_LIKELIHOOD,
} from '../data/mock';

interface ScenarioContextType {
  scenarioId: string;
  scenarioIndex: number;
  currentScenario: BreachScenarioParams;
  allScenarios: BreachScenarioParams[];
  frameIndex: number;
  currentTimestep: number;
  currentFrame: InundationFrame;
  allFrames: InundationFrame[];
  breachLikelihood: number;
  setScenarioId: (id: string) => void;
  setScenarioIndex: (index: number) => void;
  setFrameIndex: (idx: number) => void;
  setTimestep: (tMin: number) => void;
  availableTimesteps: number[];
}

const ScenarioContext = createContext<ScenarioContextType | null>(null);

const SCENARIO_STORAGE_KEY = 'pravahx:scenario_id';
const FRAME_STORAGE_KEY = 'pravahx:frame_index';

export const TIMESTEP_LIST = [0, 15, 30, 45, 60, 90, 120];

export const ScenarioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scenarioId, setScenarioIdState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SCENARIO_STORAGE_KEY);
      if (saved && SCENARIOS.some((s) => s.scenario_id === saved)) {
        return saved;
      }
    }
    return SCENARIOS[0].scenario_id;
  });

  const [frameIndex, setFrameIndexState] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(FRAME_STORAGE_KEY);
      const parsed = Number(saved);
      if (!isNaN(parsed) && parsed >= 0 && parsed < TIMESTEP_LIST.length) {
        return parsed;
      }
    }
    return 2; // Default to T+30 min (index 2)
  });

  const setScenarioId = (id: string) => {
    if (SCENARIOS.some((s) => s.scenario_id === id)) {
      setScenarioIdState(id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(SCENARIO_STORAGE_KEY, id);
      }
    }
  };

  const setScenarioIndex = (idx: number) => {
    if (idx >= 0 && idx < SCENARIOS.length) {
      const target = SCENARIOS[idx];
      setScenarioId(target.scenario_id);
    }
  };

  const setFrameIndex = (idx: number) => {
    const validIdx = Math.max(0, Math.min(TIMESTEP_LIST.length - 1, idx));
    setFrameIndexState(validIdx);
    if (typeof window !== 'undefined') {
      localStorage.setItem(FRAME_STORAGE_KEY, String(validIdx));
    }
  };

  const setTimestep = (tMin: number) => {
    const foundIdx = TIMESTEP_LIST.findIndex((t) => t === tMin);
    if (foundIdx !== -1) {
      setFrameIndex(foundIdx);
    } else {
      // Find closest
      let closestIdx = 0;
      let minDiff = 9999;
      TIMESTEP_LIST.forEach((t, i) => {
        const diff = Math.abs(t - tMin);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      });
      setFrameIndex(closestIdx);
    }
  };

  const scenarioIndex = useMemo(() => {
    const idx = SCENARIOS.findIndex((s) => s.scenario_id === scenarioId);
    return idx !== -1 ? idx : 0;
  }, [scenarioId]);

  const currentScenario = SCENARIOS[scenarioIndex];

  const allFrames = useMemo(() => {
    return MOCK_FRAMES[scenarioId] || [];
  }, [scenarioId]);

  const currentFrame = useMemo(() => {
    if (allFrames.length === 0) {
      // fallback safe frame
      return {
        scenario_id: scenarioId,
        timestep_minutes: TIMESTEP_LIST[frameIndex],
        depth_raster_path: '',
        extent_polygon_path: '',
        crs: 'EPSG:4326',
        extent_geojson: {
          type: 'Feature' as const,
          geometry: { type: 'Polygon' as const, coordinates: [] },
          properties: { timestep_minutes: TIMESTEP_LIST[frameIndex], scenario_id: scenarioId, max_depth_m: 0, avg_depth_m: 0 },
        },
        max_depth_m: 0,
        avg_depth_m: 0,
      };
    }
    return allFrames[Math.min(frameIndex, allFrames.length - 1)];
  }, [allFrames, frameIndex, scenarioId]);

  const currentTimestep = currentFrame.timestep_minutes;
  const breachLikelihood = SCENARIO_BREACH_LIKELIHOOD[scenarioId] ?? 65;

  return (
    <ScenarioContext.Provider
      value={{
        scenarioId,
        scenarioIndex,
        currentScenario,
        allScenarios: SCENARIOS,
        frameIndex,
        currentTimestep,
        currentFrame,
        allFrames,
        breachLikelihood,
        setScenarioId,
        setScenarioIndex,
        setFrameIndex,
        setTimestep,
        availableTimesteps: TIMESTEP_LIST,
      }}
    >
      {children}
    </ScenarioContext.Provider>
  );
};

export function useScenario() {
  const ctx = useContext(ScenarioContext);
  if (!ctx) {
    throw new Error('useScenario must be used within a ScenarioProvider');
  }
  return ctx;
}
