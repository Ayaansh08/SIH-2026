import type {
  BreachScenarioParams,
  Hydrograph,
  InundationFrame,
  PrecursorSignal,
  Station,
} from '../types/contracts';
import { generateCorridorPolygon } from './corridor';

export const DEMO_TAG = 'DEMO DATA · SYNTHETIC PLACEHOLDER';

export const SCENARIOS: BreachScenarioParams[] = [
  {
    scenario_id: '845cc483-db0a-4ee2-93a8-b23821ad417e',
    basin_id: 'teesta_demo_basin',
    volume_m3: 4145945.04,
    breach_width_m: 113.67,
    breach_formation_time_min: 22.78,
    terrain_slope_class: 'braided_plains',
    mannings_n: 0.03,
    valley_confinement_class: 'open',
  },
  {
    scenario_id: 'f37b0d31-692b-45e5-8da9-05f21f10dc43',
    basin_id: 'teesta_demo_basin',
    volume_m3: 888238.98,
    breach_width_m: 152.84,
    breach_formation_time_min: 172.95,
    terrain_slope_class: 'steep',
    mannings_n: 0.0508,
    valley_confinement_class: 'semi-confined',
  },
  {
    scenario_id: 'adf04236-fe48-4648-a791-f22ea0520885',
    basin_id: 'teesta_demo_basin',
    volume_m3: 7875245.1,
    breach_width_m: 30.63,
    breach_formation_time_min: 100.61,
    terrain_slope_class: 'moderate',
    mannings_n: 0.0712,
    valley_confinement_class: 'confined',
  },
];

export const SCENARIO_BREACH_LIKELIHOOD: Record<string, number> = {
  '845cc483-db0a-4ee2-93a8-b23821ad417e': 74,
  'f37b0d31-692b-45e5-8da9-05f21f10dc43': 42,
  'adf04236-fe48-4648-a791-f22ea0520885': 91,
};

export function createSyntheticHydrograph(params: BreachScenarioParams): Hydrograph {
  const peakQ = Math.round((params.volume_m3 / (params.breach_formation_time_min * 60)) * 1.85);
  const tf = params.breach_formation_time_min;
  const timeSteps = [0, 5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 90, 105, 120];

  const series: [number, number][] = timeSteps.map((t) => {
    let q = 120;
    if (t <= tf) {
      q += Math.round(peakQ * Math.pow(t / tf, 1.8));
    } else {
      q += Math.round(peakQ * Math.exp(-(t - tf) / 38));
    }
    return [t, Math.max(120, q)];
  });

  return { scenario_id: params.scenario_id, time_series: series, source: 'synthetic_placeholder' };
}

export const TIMESTEPS_MINUTES = [0, 15, 30, 45, 60, 90, 120];

export const MOCK_FRAMES: Record<string, InundationFrame[]> = {
  [SCENARIOS[0].scenario_id]: TIMESTEPS_MINUTES.map((t) =>
    generateCorridorPolygon(SCENARIOS[0].scenario_id, t, 'open')
  ),
  [SCENARIOS[1].scenario_id]: TIMESTEPS_MINUTES.map((t) =>
    generateCorridorPolygon(SCENARIOS[1].scenario_id, t, 'semi-confined')
  ),
  [SCENARIOS[2].scenario_id]: TIMESTEPS_MINUTES.map((t) =>
    generateCorridorPolygon(SCENARIOS[2].scenario_id, t, 'confined')
  ),
};

export const MOCK_HYDROGRAPHS: Record<string, Hydrograph> = {
  [SCENARIOS[0].scenario_id]: createSyntheticHydrograph(SCENARIOS[0]),
  [SCENARIOS[1].scenario_id]: createSyntheticHydrograph(SCENARIOS[1]),
  [SCENARIOS[2].scenario_id]: createSyntheticHydrograph(SCENARIOS[2]),
};

const ARR_TIMES: Record<string, Record<string, number>> = {
  'STN-CHU': { [SCENARIOS[0].scenario_id]: 0, [SCENARIOS[1].scenario_id]: 0, [SCENARIOS[2].scenario_id]: 0 },
  'STN-DIK': { [SCENARIOS[0].scenario_id]: 28, [SCENARIOS[1].scenario_id]: 34, [SCENARIOS[2].scenario_id]: 22 },
  'STN-SIN': { [SCENARIOS[0].scenario_id]: 52, [SCENARIOS[1].scenario_id]: 64, [SCENARIOS[2].scenario_id]: 41 },
  'STN-RAN': { [SCENARIOS[0].scenario_id]: 68, [SCENARIOS[1].scenario_id]: 81, [SCENARIOS[2].scenario_id]: 54 },
  'STN-TEE': { [SCENARIOS[0].scenario_id]: 88, [SCENARIOS[1].scenario_id]: 105, [SCENARIOS[2].scenario_id]: 71 },
  'STN-SEV': { [SCENARIOS[0].scenario_id]: 118, [SCENARIOS[1].scenario_id]: 142, [SCENARIOS[2].scenario_id]: 96 },
};

export const GAUGE_STATIONS: Station[] = [
  {
    id: 'STN-CHU',
    name: 'Chungthang Headworks',
    river_chainage_km: 0,
    lat: 27.602,
    lon: 88.648,
    arrival_times: ARR_TIMES['STN-CHU'],
    current_stage_m: 8.4,
    warning_stage_m: 6.0,
    danger_stage_m: 7.5,
    status: 'INUNDATED',
    history: [2.1, 2.4, 3.8, 6.2, 7.8, 8.4],
  },
  {
    id: 'STN-DIK',
    name: 'Dikchu Dam Tailrace',
    river_chainage_km: 32,
    lat: 27.398,
    lon: 88.548,
    arrival_times: ARR_TIMES['STN-DIK'],
    current_stage_m: 6.1,
    warning_stage_m: 5.5,
    danger_stage_m: 7.0,
    status: 'ALERT',
    history: [1.8, 2.0, 2.2, 3.5, 4.8, 6.1],
  },
  {
    id: 'STN-SIN',
    name: 'Singtam Suspension Bridge',
    river_chainage_km: 62,
    lat: 27.231,
    lon: 88.498,
    arrival_times: ARR_TIMES['STN-SIN'],
    current_stage_m: 4.8,
    warning_stage_m: 4.5,
    danger_stage_m: 6.0,
    status: 'WATCH',
    history: [1.2, 1.3, 1.6, 2.4, 3.7, 4.8],
  },
  {
    id: 'STN-RAN',
    name: 'Rangpo Inter-State Barrier',
    river_chainage_km: 76,
    lat: 27.178,
    lon: 88.527,
    arrival_times: ARR_TIMES['STN-RAN'],
    current_stage_m: 3.2,
    warning_stage_m: 4.0,
    danger_stage_m: 5.5,
    status: 'NORMAL',
    history: [0.9, 1.0, 1.1, 1.4, 2.1, 3.2],
  },
  {
    id: 'STN-TEE',
    name: 'Teesta Bazar Highway Bridge',
    river_chainage_km: 98,
    lat: 27.078,
    lon: 88.468,
    arrival_times: ARR_TIMES['STN-TEE'],
    current_stage_m: 2.5,
    warning_stage_m: 4.2,
    danger_stage_m: 5.8,
    status: 'NORMAL',
    history: [1.0, 1.1, 1.2, 1.3, 1.8, 2.5],
  },
  {
    id: 'STN-SEV',
    name: 'Sevoke Railway Bridge (Siliguri)',
    river_chainage_km: 128,
    lat: 26.882,
    lon: 88.469,
    arrival_times: ARR_TIMES['STN-SEV'],
    current_stage_m: 1.8,
    warning_stage_m: 3.8,
    danger_stage_m: 5.0,
    status: 'NORMAL',
    history: [0.8, 0.8, 0.9, 1.0, 1.3, 1.8],
  },
];

export const PRECURSOR_SIGNALS: PrecursorSignal[] = [
  {
    id: 'SIG-LAK-01',
    parameter: 'Lake Level Rise Rate',
    value: 14.8,
    unit: 'cm/hr',
    z_score: 3.8,
    confidence_pct: 94,
    timestamp: '2026-09-29T16:15:00Z',
    status: 'ALERT',
    location: 'South Lhonak Moraine Lake',
  },
  {
    id: 'SIG-SEI-02',
    parameter: 'Seismic Tremor (0.5-2Hz)',
    value: 2.9,
    unit: 'µm/s',
    z_score: 2.7,
    confidence_pct: 88,
    timestamp: '2026-09-29T16:22:00Z',
    status: 'ALERT',
    location: 'Chungthang Station (CHUN)',
  },
  {
    id: 'SIG-MOR-03',
    parameter: 'Moraine Displacement (InSAR/GNSS)',
    value: 4.2,
    unit: 'mm/day',
    z_score: 2.4,
    confidence_pct: 81,
    timestamp: '2026-09-29T15:45:00Z',
    status: 'WATCH',
    location: 'North Lateral Moraine',
  },
  {
    id: 'SIG-MET-04',
    parameter: '24h Cumulative Precipitation',
    value: 86.4,
    unit: 'mm',
    z_score: 1.9,
    confidence_pct: 96,
    timestamp: '2026-09-29T16:00:00Z',
    status: 'WATCH',
    location: 'North Sikkim AWS Cluster',
  },
  {
    id: 'SIG-HYD-05',
    parameter: 'Upstream Gauge Rapid Drop',
    value: -0.45,
    unit: 'm/15min',
    z_score: -2.3,
    confidence_pct: 89,
    timestamp: '2026-09-29T16:28:00Z',
    status: 'ALERT',
    location: 'Lachen Flume Inlet',
  },
];
