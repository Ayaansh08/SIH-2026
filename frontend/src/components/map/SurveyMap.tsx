import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { InundationFrame, Station } from '../../types/contracts';
import { TEESTA_CORRIDOR_NODES } from '../../data/corridor';
import { MAP_CONFIG } from '../../config/map';

interface SurveyMapProps {
  frame: InundationFrame | null;
  stations: Station[];
  selectedStationId?: string;
  onSelectStation: (stn: Station) => void;
  className?: string;
}

export const SurveyMap = ({
  frame,
  stations,
  selectedStationId,
  onSelectStation,
  className = '',
}: SurveyMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const corridorLayerRef = useRef<L.Polyline | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered around Singtam / Dikchu corridor
    const map = L.map(mapContainerRef.current, {
      center: [27.24, 88.52],
      zoom: 10,
      zoomControl: false,
      attributionControl: false,
    });

    // Standard OSM tiles with CSS tactical dark filter (No API key needed)
    L.tileLayer(MAP_CONFIG.tileUrl, {
      subdomains: MAP_CONFIG.subdomains,
      attribution: MAP_CONFIG.attribution,
      maxZoom: MAP_CONFIG.maxZoom,
      minZoom: MAP_CONFIG.minZoom,
    }).addTo(map);

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // River centerline polyline
    const corridorPoints: [number, number][] = TEESTA_CORRIDOR_NODES.map((n) => [n[0], n[1]]);
    corridorLayerRef.current = L.polyline(corridorPoints, {
      color: '#6E8B74',
      weight: 2,
      dashArray: '4 4',
      opacity: 0.8,
    }).addTo(map);

    markerGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Inundation Polygon Frame
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !frame) return;

    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }

    const ring = frame.extent_geojson.geometry.coordinates[0];
    if (!ring || ring.length < 3) return;

    // Convert GeoJSON [lon, lat] -> Leaflet [lat, lon]
    const latLngs: [number, number][] = ring.map((c) => [c[1], c[0]]);

    // Depth color ramp: shallow #E7D9A8 -> #C9A65B -> #A8702F -> deep #6B3213
    const maxDepth = frame.max_depth_m;
    const depthColor =
      maxDepth > 9 ? '#6B3213' : maxDepth > 5.5 ? '#A8702F' : maxDepth > 3 ? '#C9A65B' : '#E7D9A8';

    const polygon = L.polygon(latLngs, {
      color: depthColor,
      weight: 1.5,
      fillColor: depthColor,
      fillOpacity: 0.45,
      className: 'hatch-pattern', // Inundation diagonal hatch overlay
    }).addTo(map);

    polygonLayerRef.current = polygon;
  }, [frame]);

  // Update Station Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    stations.forEach((stn) => {
      const isSelected = selectedStationId === stn.id;
      const isDanger = stn.status === 'ALERT' || stn.status === 'INUNDATED';
      const isWatch = stn.status === 'WATCH';
      const color = isDanger ? '#E2461F' : isWatch ? '#E0A526' : '#6E8B74';

      // Custom Square Tick Marker (max 2px radius)
      const icon = L.divIcon({
        className: 'survey-marker-container',
        html: `
          <div style="display:flex; align-items:center; gap:6px; cursor:pointer;">
            <div style="width:12px; height:12px; background:#11171A; border:2px solid ${color}; border-radius:2px; display:flex; align-items:center; justify-content:center; box-shadow: 0 0 4px ${color}88;">
              <div style="width:4px; height:4px; background:${color}; border-radius:1px;"></div>
            </div>
            <div style="background:#11171A; border:1px solid ${isSelected ? '#E6E2D3' : '#2E3B40'}; padding:1px 5px; font-family:'IBM Plex Mono',monospace; font-size:10px; color:#E6E2D3; white-space:nowrap; letter-spacing:0.04em;">
              <span style="color:${color}; font-weight:600;">[${stn.id}]</span> ${stn.name.split(' ')[0]} ${stn.current_stage_m}m
            </div>
          </div>
        `,
        iconSize: [120, 20],
        iconAnchor: [6, 10],
      });

      const marker = L.marker([stn.lat, stn.lon], { icon }).addTo(group);
      marker.on('click', () => {
        onSelectStation(stn);
        map.panTo([stn.lat, stn.lon], { animate: true });
      });
    });
  }, [stations, selectedStationId, onSelectStation]);

  // Pan to selected station when changed externally (e.g. from Command palette)
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedStationId) return;
    const stn = stations.find((s) => s.id === selectedStationId);
    if (stn) {
      mapInstanceRef.current.panTo([stn.lat, stn.lon], { animate: true });
    }
  }, [selectedStationId, stations]);

  return (
    <div className={`relative survey-map overflow-hidden border border-rule bg-gauge-room ${className}`}>
      {/* Map Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Sheet Corner Registration Marks */}
      <span className="absolute top-2 left-2 z-[500] font-mono text-scale-13 text-contour pointer-events-none">┼</span>
      <span className="absolute top-2 right-2 z-[500] font-mono text-scale-13 text-contour pointer-events-none">┼</span>
      <span className="absolute bottom-2 left-2 z-[500] font-mono text-scale-13 text-contour pointer-events-none">┼</span>
      <span className="absolute bottom-2 right-2 z-[500] font-mono text-scale-13 text-contour pointer-events-none">┼</span>

      {/* Top Survey Header Coordinates Bar */}
      <div className="absolute top-2 left-8 right-8 z-[500] pointer-events-none flex items-center justify-between text-[10px] font-mono text-contour bg-gauge-room/85 px-3 py-1 border border-rule/80">
        <div className="flex items-center gap-3">
          <span className="text-offwhite font-bold">TEESTA RIVER CORRIDOR</span>
          <span>GRID: 27.60°N 88.65°E → 26.88°N 88.47°E</span>
        </div>
        <div className="flex items-center gap-3">
          <span>CRS: EPSG:4326</span>
          <span className="text-lichen">SURVEY BASE FILTERED</span>
        </div>
      </div>

      {/* Depth Ramp Legend Box */}
      <div className="absolute bottom-4 left-4 z-[500] bg-gauge-room/90 border border-rule p-2 pointer-events-auto flex flex-col gap-1 text-[10px] font-mono">
        <span className="text-contour uppercase tracking-wider text-[9px] font-semibold">
          INUNDATION DEPTH RAMP
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="flex items-center">
            <span className="w-4 h-3 bg-[#E7D9A8] inline-block border border-rule" />
            <span className="w-4 h-3 bg-[#C9A65B] inline-block border border-rule -ml-[1px]" />
            <span className="w-4 h-3 bg-[#A8702F] inline-block border border-rule -ml-[1px]" />
            <span className="w-4 h-3 bg-[#6B3213] inline-block border border-rule -ml-[1px]" />
          </div>
          <span className="text-offwhite ml-1">0.5m → 12.0m+ (UMBER)</span>
        </div>
        <div className="flex items-center gap-1 text-contour text-[9px]">
          <span className="w-3 h-2 bg-danger-vermilion/30 border border-danger-vermilion inline-block" />
          <span>DIAGONAL HATCH: EXTENT</span>
        </div>
      </div>
    </div>
  );
};
