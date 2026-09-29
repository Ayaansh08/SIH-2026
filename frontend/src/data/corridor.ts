import type { InundationFrame, InundationPolygonFeature, ValleyConfinementClass } from '../types/contracts';

// Hand-written surveyed center-line of the Teesta River corridor from Chungthang to Sevoke
export const TEESTA_CORRIDOR_NODES: [number, number, string, number][] = [
  // [lat, lon, station_name, chainage_km]
  [27.602, 88.648, 'Chungthang (Dam/Lake Outlet)', 0],
  [27.485, 88.592, 'Mangan Gorge', 18],
  [27.398, 88.548, 'Dikchu Dam Site', 32],
  [27.288, 88.515, 'Makha Valley', 48],
  [27.231, 88.498, 'Singtam Bridge', 62],
  [27.178, 88.527, 'Rangpo Checkpost', 76],
  [27.125, 88.492, 'Melli Confluence', 88],
  [27.078, 88.468, 'Teesta Bazar Bridge', 98],
  [26.965, 88.462, 'Kalijhora Siphon', 114],
  [26.882, 88.469, 'Sevoke Railway Bridge', 128],
];

export function generateCorridorPolygon(
  scenarioId: string,
  tMin: number,
  confinement: ValleyConfinementClass
): InundationFrame {
  // Reach length progresses with time (approx 1.1 to 1.4 km/min wave speed)
  const speedKmPerMin = confinement === 'confined' ? 1.35 : confinement === 'semi-confined' ? 1.15 : 0.95;
  const maxReachKm = Math.min(135, Math.max(12, tMin * speedKmPerMin));

  // Determine active corridor nodes up to reach
  const activeNodes = TEESTA_CORRIDOR_NODES.filter((n) => n[3] <= maxReachKm);
  if (activeNodes.length < 2) {
    activeNodes.push(TEESTA_CORRIDOR_NODES[1]);
  }

  // Width spread depends on confinement and timestep
  const baseOffsetDeg = confinement === 'open' ? 0.022 : confinement === 'semi-confined' ? 0.012 : 0.007;
  const expansionFactor = Math.min(1.6, 0.7 + (tMin / 120) * 0.9);
  const offset = baseOffsetDeg * expansionFactor;

  // Generate left and right offset boundaries
  const leftCoords: [number, number][] = [];
  const rightCoords: [number, number][] = [];

  for (let i = 0; i < activeNodes.length; i++) {
    const [lat, lon] = [activeNodes[i][0], activeNodes[i][1]];
    // Approximate normal vector by taking perpendicular to step
    const next = activeNodes[Math.min(activeNodes.length - 1, i + 1)];
    const prev = activeNodes[Math.max(0, i - 1)];
    const dLat = next[0] - prev[0];
    const dLon = next[1] - prev[1];
    const len = Math.hypot(dLat, dLon) || 1;
    const nLat = -dLon / len;
    const nLon = dLat / len;

    // GeoJSON format: [longitude, latitude]
    leftCoords.push([lon + nLon * offset, lat + nLat * offset]);
    rightCoords.push([lon - nLon * offset, lat - nLat * offset]);
  }

  const polygonRing = [...leftCoords, ...rightCoords.reverse(), leftCoords[0]];

  // Depth calculation based on peak wave timing and confinement
  const depthMultiplier = confinement === 'confined' ? 1.45 : confinement === 'semi-confined' ? 1.05 : 0.75;
  const waveShape = tMin <= 45 ? (tMin / 45) : Math.max(0.2, 1 - ((tMin - 45) / 95) * 0.7);
  const maxDepth = Number((8.5 * depthMultiplier * waveShape).toFixed(2));
  const avgDepth = Number((maxDepth * 0.48).toFixed(2));

  const geojson: InundationPolygonFeature = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [polygonRing],
    },
    properties: {
      timestep_minutes: tMin,
      scenario_id: scenarioId,
      max_depth_m: maxDepth,
      avg_depth_m: avgDepth,
      flow_velocity_ms: Number((4.2 * depthMultiplier).toFixed(1)),
    },
  };

  return {
    scenario_id: scenarioId,
    timestep_minutes: tMin,
    depth_raster_path: `/data/rasters/${scenarioId}/depth_t${tMin}.tif`,
    extent_polygon_path: `/data/vectors/${scenarioId}/extent_t${tMin}.geojson`,
    crs: 'EPSG:4326',
    extent_geojson: geojson,
    max_depth_m: maxDepth,
    avg_depth_m: avgDepth,
  };
}
