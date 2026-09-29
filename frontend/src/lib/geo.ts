import type { InundationFrame } from '../types/contracts';

export interface Bridge {
  id: string;
  name: string;
  nameHi: string;
  lat: number;
  lon: number;
  chainage_km: number;
  span_m: number;
  type: string;
  last_inspected: string;
}

export type BridgeStatus = 'OPEN' | 'AVOID' | 'CLOSED';

export interface BridgeStatusResult {
  status: BridgeStatus;
  unsafeFromMin?: number;
}

/**
 * Ray-casting algorithm to determine if a point [lat, lon] is inside a GeoJSON polygon ring [ [lon, lat], ... ].
 */
export function pointInPolygon(point: [number, number], ring: number[][]): boolean {
  if (!ring || ring.length < 3) return false;
  const [lat, lon] = point;
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0]; // lon
    const yi = ring[i][1]; // lat
    const xj = ring[j][0]; // lon
    const yj = ring[j][1]; // lat

    const intersect = yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi || 1e-10) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Check if two line segments (p1-p2 and p3-p4) intersect.
 */
function ccw(p1: [number, number], p2: [number, number], p3: [number, number]): boolean {
  return (p3[1] - p1[1]) * (p2[0] - p1[0]) > (p2[1] - p1[1]) * (p3[0] - p1[0]);
}

export function segmentsIntersect(
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  p4: [number, number]
): boolean {
  return (
    ccw(p1, p3, p4) !== ccw(p2, p3, p4) &&
    ccw(p1, p2, p3) !== ccw(p1, p2, p4)
  );
}

/**
 * Check if a line segment between [lat1, lon1] and [lat2, lon2] intersects any edge of a GeoJSON polygon ring [lon, lat][].
 */
export function segmentIntersectsPolygon(
  p1: [number, number], // [lat, lon]
  p2: [number, number], // [lat, lon]
  ring: number[][] // [lon, lat][]
): boolean {
  if (!ring || ring.length < 3) return false;

  // If either endpoint is inside, it intersects
  if (pointInPolygon(p1, ring) || pointInPolygon(p2, ring)) return true;

  // Check edge crossings
  for (let i = 0; i < ring.length - 1; i++) {
    const e1: [number, number] = [ring[i][1], ring[i][0]]; // [lat, lon]
    const e2: [number, number] = [ring[i + 1][1], ring[i + 1][0]];
    if (segmentsIntersect(p1, p2, e1, e2)) {
      return true;
    }
  }

  return false;
}

/**
 * Expand a GeoJSON polygon ring by a distance (buffer in degrees, ~150m is approx 0.00135 deg).
 */
export function bufferPolygonRing(ring: number[][], bufferDeg: number = 0.0015): number[][] {
  if (!ring || ring.length < 3) return ring;

  // Calculate polygon centroid
  let sumLon = 0;
  let sumLat = 0;
  const count = ring.length;
  ring.forEach(([lon, lat]) => {
    sumLon += lon;
    sumLat += lat;
  });
  const cLon = sumLon / count;
  const cLat = sumLat / count;

  // Radial expansion from centroid
  return ring.map(([lon, lat]) => {
    const dLon = lon - cLon;
    const dLat = lat - cLat;
    const dist = Math.hypot(dLon, dLat) || 1;
    const scale = (dist + bufferDeg) / dist;
    return [cLon + dLon * scale, cLat + dLat * scale];
  });
}

/**
 * Pure function to derive bridge status:
 * - CLOSED if inside current frame
 * - AVOID if inundated within next 60 min
 * - OPEN otherwise
 */
export function deriveBridgeStatus(
  bridge: Bridge,
  currentFrame: InundationFrame,
  allFrames: InundationFrame[]
): BridgeStatusResult {
  const currentRing = currentFrame?.extent_geojson?.geometry?.coordinates?.[0] || [];
  const pt: [number, number] = [bridge.lat, bridge.lon];

  // 1. Check if currently closed
  if (pointInPolygon(pt, currentRing)) {
    return { status: 'CLOSED' };
  }

  // 2. Check future frames within next 60 minutes
  const currentT = currentFrame?.timestep_minutes ?? 0;
  const futureFrames = (allFrames || [])
    .filter((f) => f.timestep_minutes > currentT && f.timestep_minutes <= currentT + 60)
    .sort((a, b) => a.timestep_minutes - b.timestep_minutes);

  for (const f of futureFrames) {
    const fRing = f.extent_geojson?.geometry?.coordinates?.[0] || [];
    if (pointInPolygon(pt, fRing)) {
      return {
        status: 'AVOID',
        unsafeFromMin: f.timestep_minutes,
      };
    }
  }

  return { status: 'OPEN' };
}
