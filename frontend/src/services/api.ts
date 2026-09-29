/**
 * TeestaWatch API Service Layer
 *
 * Designed to mirror future FastAPI backend endpoints:
 *   GET /api/v1/scenarios                -> BreachScenarioParams[]
 *   GET /api/v1/scenarios/{id}/hydrograph -> Hydrograph
 *   GET /api/v1/scenarios/{id}/frames    -> InundationFrame[]
 *   GET /api/v1/anomalies                -> PrecursorSignal[]
 *   GET /api/v1/stations                 -> Station[]
 *   GET /api/v1/scenarios/{id}/likelihood -> { scenario_id: string, likelihood_pct: number }
 */

import type {
  BreachScenarioParams,
  Hydrograph,
  InundationFrame,
  PrecursorSignal,
  Station,
} from '../types/contracts';
import {
  GAUGE_STATIONS,
  MOCK_FRAMES,
  MOCK_HYDROGRAPHS,
  PRECURSOR_SIGNALS,
  SCENARIOS,
  SCENARIO_BREACH_LIKELIHOOD,
} from '../data/mock';

const NETWORK_LATENCY_MS = 60;

function simulateDelay<T>(data: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), NETWORK_LATENCY_MS));
}

export async function getScenarios(): Promise<BreachScenarioParams[]> {
  return simulateDelay([...SCENARIOS]);
}

export async function getHydrograph(scenarioId: string): Promise<Hydrograph | null> {
  const hydrograph = MOCK_HYDROGRAPHS[scenarioId] || null;
  return simulateDelay(hydrograph);
}

export async function getFrames(scenarioId: string): Promise<InundationFrame[]> {
  const frames = MOCK_FRAMES[scenarioId] || [];
  return simulateDelay([...frames]);
}

export async function getAnomalies(): Promise<PrecursorSignal[]> {
  return simulateDelay([...PRECURSOR_SIGNALS]);
}

export async function getStations(): Promise<Station[]> {
  return simulateDelay([...GAUGE_STATIONS]);
}

export async function getBreachLikelihood(scenarioId: string): Promise<number> {
  const likelihood = SCENARIO_BREACH_LIKELIHOOD[scenarioId] ?? 65;
  return simulateDelay(likelihood);
}
