import { EVAC_NODES, EVAC_EDGES, type EvacNode, type EvacEdge } from '../data/graph';
import { deriveBridgeStatus, segmentIntersectsPolygon, type Bridge } from './geo';
import type { InundationFrame } from '../types/contracts';

export interface RouteStep {
  stepNumber: string; // '01', '02'
  instructionEn: string;
  instructionHi: string;
  distanceM: number;
  etaMin: number;
  node: EvacNode;
}

export interface RouteResult {
  nodeIds: string[];
  pathCoords: [number, number][]; // [lat, lon]
  targetShelter: EvacNode | null;
  totalDistanceM: number;
  totalEtaMin: number;
  steps: RouteStep[];
  blockedSegments: [number, number][][];
  routeChanged?: boolean;
  unsafeBridgeName?: string;
  unsafeAtMin?: number;
  noSafeRoute?: boolean;
}

const WALKING_SPEED_NORMAL_MPM = 75; // 4.5 km/h = 75 m/min
const WALKING_SPEED_UPHILL_MPM = 50; // 3.0 km/h = 50 m/min

export function solveDijkstra(
  startNodeId: string,
  mode: 'BEFORE' | 'DURING' | 'AFTER',
  currentFrame: InundationFrame,
  allFrames: InundationFrame[],
  bridges: Bridge[]
): RouteResult {
  const nodeMap = new Map<string, EvacNode>();
  EVAC_NODES.forEach((n) => nodeMap.set(n.id, n));

  const startNode = nodeMap.get(startNodeId) || EVAC_NODES[0];
  const polygonRing = currentFrame?.extent_geojson?.geometry?.coordinates?.[0] || [];

  const bridgeStatusMap = new Map<string, { status: string; unsafeFromMin?: number }>();
  bridges.forEach((b) => {
    bridgeStatusMap.set(b.id, deriveBridgeStatus(b, currentFrame, allFrames));
  });

  const validEdges: (EvacEdge & { weight: number; isBlocked?: boolean })[] = [];
  const blockedSegs: [number, number][][] = [];
  let detectedUnsafeBridgeName: string | undefined;
  let detectedUnsafeAtMin: number | undefined;

  EVAC_EDGES.forEach((edge) => {
    const fromNode = nodeMap.get(edge.from);
    const toNode = nodeMap.get(edge.to);
    if (!fromNode || !toNode) return;

    let speed = edge.uphill ? WALKING_SPEED_UPHILL_MPM : WALKING_SPEED_NORMAL_MPM;
    let weight = edge.walkMeters / speed;

    if (mode === 'BEFORE') {
      validEdges.push({ ...edge, weight });
    } else if (mode === 'DURING') {
      let dropEdge = false;

      if (edge.viaBridgeId) {
        const bStatus = bridgeStatusMap.get(edge.viaBridgeId);
        if (bStatus?.status === 'CLOSED' || bStatus?.status === 'AVOID') {
          dropEdge = true;
          const brg = bridges.find((b) => b.id === edge.viaBridgeId);
          if (brg) {
            detectedUnsafeBridgeName = brg.name;
            detectedUnsafeAtMin = bStatus.unsafeFromMin ?? currentFrame?.timestep_minutes ?? 0;
          }
        }
      }

      if (!dropEdge && polygonRing.length >= 3) {
        const p1: [number, number] = [fromNode.lat, fromNode.lon];
        const p2: [number, number] = [toNode.lat, toNode.lon];
        if (segmentIntersectsPolygon(p1, p2, polygonRing)) {
          dropEdge = true;
        }
      }

      if (dropEdge) {
        blockedSegs.push([
          [fromNode.lat, fromNode.lon],
          [toNode.lat, toNode.lon],
        ]);
      } else {
        validEdges.push({ ...edge, weight });
      }
    } else if (mode === 'AFTER') {
      if (edge.viaBridgeId) {
        const bStatus = bridgeStatusMap.get(edge.viaBridgeId);
        if (bStatus?.status === 'CLOSED' || bStatus?.status === 'AVOID') {
          weight *= 5.0;
        }
      }

      if (edge.blockedAfterFlood) {
        blockedSegs.push([
          [fromNode.lat, fromNode.lon],
          [toNode.lat, toNode.lon],
        ]);
      } else {
        validEdges.push({ ...edge, weight });
      }
    }
  });

  const distances = new Map<string, number>();
  const previous = new Map<string, string>();
  const edgeUsed = new Map<string, EvacEdge>();
  const unvisited = new Set<string>();

  EVAC_NODES.forEach((n) => {
    distances.set(n.id, Infinity);
    unvisited.add(n.id);
  });
  distances.set(startNode.id, 0);

  while (unvisited.size > 0) {
    let currentId: string | null = null;
    let minD = Infinity;
    unvisited.forEach((id) => {
      const d = distances.get(id) ?? Infinity;
      if (d < minD) {
        minD = d;
        currentId = id;
      }
    });

    if (currentId === null || minD === Infinity) break;
    unvisited.delete(currentId);

    const curr = currentId as string;
    const currDist = minD;

    const outgoing = validEdges.filter((e) => e.from === curr);
    outgoing.forEach((edge) => {
      if (!unvisited.has(edge.to)) return;
      const alt = currDist + edge.weight;
      if (alt < (distances.get(edge.to) ?? Infinity)) {
        distances.set(edge.to, alt);
        previous.set(edge.to, curr);
        edgeUsed.set(edge.to, edge);
      }
    });
  }

  const shelters = EVAC_NODES.filter((n) => n.type === 'shelter');
  let bestShelter: EvacNode | null = null;
  let bestDist = Infinity;

  shelters.forEach((sh) => {
    const d = distances.get(sh.id) ?? Infinity;
    if (d < bestDist && d < Infinity) {
      bestDist = d;
      bestShelter = sh;
    }
  });

  if (!bestShelter) {
    return {
      nodeIds: [startNode.id],
      pathCoords: [[startNode.lat, startNode.lon]],
      targetShelter: null,
      totalDistanceM: 0,
      totalEtaMin: 0,
      steps: [],
      blockedSegments: blockedSegs,
      noSafeRoute: true,
      routeChanged: mode === 'DURING' && Boolean(detectedUnsafeBridgeName),
      unsafeBridgeName: detectedUnsafeBridgeName,
      unsafeAtMin: detectedUnsafeAtMin,
    };
  }

  const chosenShelter: EvacNode = bestShelter;
  const pathIds: string[] = [];
  let curr: string | undefined = chosenShelter.id;
  while (curr) {
    pathIds.unshift(curr);
    curr = previous.get(curr);
  }

  const pathNodes = pathIds.map((id) => nodeMap.get(id)!);
  const pathCoords: [number, number][] = pathNodes.map((n) => [n.lat, n.lon]);

  let totalMeters = 0;
  const steps: RouteStep[] = [];

  for (let i = 0; i < pathNodes.length; i++) {
    const node = pathNodes[i];
    const prevNode = i > 0 ? pathNodes[i - 1] : null;
    let distM = 0;

    if (prevNode) {
      const edge = edgeUsed.get(node.id);
      distM = edge?.walkMeters || 500;
      totalMeters += distM;
    }

    const stepEta = Math.round(distM / WALKING_SPEED_NORMAL_MPM) || 1;

    let instructionEn = i === 0
      ? `Depart from ${node.name}`
      : i === pathNodes.length - 1
      ? `Arrive at safe refuge: ${node.name}`
      : `${node.landmark} toward ${node.name}`;

    let instructionHi = i === 0
      ? `${node.nameHi} से प्रस्थान करें`
      : i === pathNodes.length - 1
      ? `सुरक्षित आश्रय स्थल पहुंचें: ${node.nameHi}`
      : `${node.landmarkHi} (${node.nameHi})`;

    steps.push({
      stepNumber: String(i + 1).padStart(2, '0'),
      instructionEn,
      instructionHi,
      distanceM: distM,
      etaMin: stepEta,
      node,
    });
  }

  const totalEtaMin = Math.max(1, Math.round(bestDist));

  return {
    nodeIds: pathIds,
    pathCoords,
    targetShelter: chosenShelter,
    totalDistanceM: totalMeters,
    totalEtaMin,
    steps,
    blockedSegments: blockedSegs,
    routeChanged: mode === 'DURING' && Boolean(detectedUnsafeBridgeName),
    unsafeBridgeName: detectedUnsafeBridgeName,
    unsafeAtMin: detectedUnsafeAtMin,
  };
}
