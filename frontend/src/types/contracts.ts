/**
 * Core data contracts mirroring /ml/schemas.py for TeestaWatch flood simulation.
 * Field names carry exact physical units.
 */

export type TerrainSlopeClass = 'steep' | 'moderate' | 'braided_plains';

export type ValleyConfinementClass = 'confined' | 'semi-confined' | 'open';

export type HydrographSource = 'SPH' | 'synthetic_placeholder';

export type SplitAssignment = 'train' | 'val' | 'test';

export interface BreachScenarioParams {
  volume_m3: number;
  breach_width_m: number;
  breach_formation_time_min: number;
  terrain_slope_class: TerrainSlopeClass;
  mannings_n: number;
  valley_confinement_class: ValleyConfinementClass;
  basin_id: string;
  scenario_id: string;
}

export type HydrographPoint = [number, number]; // [timestep_minutes, discharge_cumecs]

export interface Hydrograph {
  scenario_id: string;
  time_series: HydrographPoint[];
  source: HydrographSource;
}

export interface InundationPolygonFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon';
    coordinates: number[][][]; // [lon, lat][]
  };
  properties: {
    timestep_minutes: number;
    scenario_id: string;
    max_depth_m: number;
    avg_depth_m: number;
    flow_velocity_ms?: number;
  };
}

export interface InundationFrame {
  scenario_id: string;
  timestep_minutes: number;
  depth_raster_path: string;
  extent_polygon_path: string;
  crs: string;
  extent_geojson: InundationPolygonFeature;
  max_depth_m: number;
  avg_depth_m: number;
}

export interface ScenarioRun {
  scenario_params: BreachScenarioParams;
  hydrograph: Hydrograph;
  inundation_frames: InundationFrame[];
  created_at: string;
  basin_id: string;
  split: SplitAssignment;
  metadata: Record<string, unknown>;
}

export type StationStatus = 'NORMAL' | 'WATCH' | 'ALERT' | 'INUNDATED';

export interface Station {
  id: string;
  name: string;
  river_chainage_km: number;
  lat: number;
  lon: number;
  arrival_times: Record<string, number>; // scenario_id -> arrival time in minutes
  current_stage_m: number;
  warning_stage_m: number;
  danger_stage_m: number;
  status: StationStatus;
  history: number[]; // sparkline stages
}

export type AnomalyStatus = 'NORMAL' | 'WATCH' | 'ALERT';

export interface PrecursorSignal {
  id: string;
  parameter: string;
  value: number;
  unit: string;
  z_score: number;
  confidence_pct: number;
  timestamp: string;
  status: AnomalyStatus;
  location: string;
}
