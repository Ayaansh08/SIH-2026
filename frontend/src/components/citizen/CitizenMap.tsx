import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useScenario } from '../../context/ScenarioContext';
import { useLang } from '../../i18n/useLang';
import { BRIDGES } from '../../data/bridges';
import { EVAC_NODES } from '../../data/graph';
import { INITIAL_ASSETS, evaluateAssets, type EvaluatedAsset } from '../../data/assets';
import { deriveBridgeStatus, bufferPolygonRing, type Bridge } from '../../lib/geo';
import { BridgeNotice } from './BridgeNotice';
import { Sheet } from '../lightswind/Sheet';
import { MAP_CONFIG } from '../../config/map';

interface CitizenMapProps {
  activeTab?: 'status' | 'map' | 'evacuate' | 'protect';
  routeCoords?: [number, number][];
  blockedSegments?: [number, number][][];
  selectedAssetId?: string;
  onNavigateToEvacuate?: (bridgeId?: string) => void;
  className?: string;
  showControls?: boolean;
}

export const CitizenMap: React.FC<CitizenMapProps> = ({
  activeTab = 'status',
  routeCoords = [],
  blockedSegments = [],
  selectedAssetId,
  onNavigateToEvacuate,
  className = '',
  showControls = true,
}) => {
  const { currentFrame, allFrames, frameIndex, setFrameIndex, availableTimesteps } = useScenario();
  const { t } = useLang();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const inundationLayerRef = useRef<L.Polygon | null>(null);
  const bufferLayerRef = useRef<L.Polygon | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const blockedLinesRef = useRef<L.LayerGroup | null>(null);

  const [showDangerZones, setShowDangerZones] = useState(true);
  const [showBridges, setShowBridges] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showInfra, setShowInfra] = useState(true);

  const [selectedBridge, setSelectedBridge] = useState<Bridge | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [27.35, 88.55],
      zoom: 10,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer(MAP_CONFIG.tileUrl, {
      subdomains: MAP_CONFIG.subdomains,
      attribution: MAP_CONFIG.attribution,
      maxZoom: MAP_CONFIG.maxZoom,
      minZoom: MAP_CONFIG.minZoom,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    blockedLinesRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Inundation Polygon and Buffer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (inundationLayerRef.current) {
      map.removeLayer(inundationLayerRef.current);
      inundationLayerRef.current = null;
    }
    if (bufferLayerRef.current) {
      map.removeLayer(bufferLayerRef.current);
      bufferLayerRef.current = null;
    }

    if (!showDangerZones || !currentFrame) return;

    const ring = currentFrame.extent_geojson?.geometry?.coordinates?.[0];
    if (!ring || ring.length < 3) return;

    const latLngs: [number, number][] = ring.map((c) => [c[1], c[0]]);
    const bufferRing = bufferPolygonRing(ring, 0.0018);
    const bufferLatLngs: [number, number][] = bufferRing.map((c) => [c[1], c[0]]);

    const bufPoly = L.polygon(bufferLatLngs, {
      color: '#E0A526',
      weight: 1.5,
      dashArray: '4 4',
      fillColor: '#E0A526',
      fillOpacity: 0.18,
    }).addTo(map);
    bufferLayerRef.current = bufPoly;

    const poly = L.polygon(latLngs, {
      color: '#E2461F',
      weight: 2,
      fillColor: '#E2461F',
      fillOpacity: 0.38,
      className: 'hatch-pattern',
    }).addTo(map);
    inundationLayerRef.current = poly;
  }, [currentFrame, showDangerZones]);

  // Update Route Polyline & Blocked Segments (for Evacuate Tab)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const blockedGroup = blockedLinesRef.current;
    if (!map || !blockedGroup) return;

    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }
    blockedGroup.clearLayers();

    if (activeTab === 'evacuate' && routeCoords.length >= 2) {
      const poly = L.polyline(routeCoords, {
        color: '#6E8B74',
        weight: 4,
        dashArray: '8 6',
        opacity: 0.95,
      }).addTo(map);
      routePolylineRef.current = poly;

      // Fit bounds to route
      try {
        map.fitBounds(poly.getBounds(), { padding: [40, 40], maxZoom: 12 });
      } catch {
        // ignore
      }

      // Blocked Segments
      blockedSegments.forEach(([p1, p2]) => {
        L.polyline([p1, p2], {
          color: '#E2461F',
          weight: 4,
          dashArray: '3 3',
        }).addTo(blockedGroup);
      });
    }
  }, [activeTab, routeCoords, blockedSegments]);

  // Update Markers (Shelters, Bridges, Assets)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markersLayerRef.current;
    if (!map || !group || !currentFrame) return;

    group.clearLayers();

    // 1. Shelters
    if (showShelters || activeTab === 'evacuate') {
      const shelters = EVAC_NODES.filter((n) => n.type === 'shelter');
      shelters.forEach((sh) => {
        const icon = L.divIcon({
          className: '',
          html: `
            <div style="display:flex; align-items:center; gap:4px; cursor:pointer;">
              <div style="width:14px; height:14px; background:#6E8B74; border:2px solid #11171A; display:flex; align-items:center; justify-content:center;">
                <div style="width:4px; height:4px; background:#E6E2D3;"></div>
              </div>
              <span style="font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:700; color:#E6E2D3; background:#1A2226; border:1px solid #2E3B40; padding:1px 4px; white-space:nowrap;">
                ${sh.name.split(' ')[0]}
              </span>
            </div>
          `,
          iconSize: [110, 20],
          iconAnchor: [7, 10],
        });

        L.marker([sh.lat, sh.lon], { icon }).addTo(group);
      });
    }

    // 2. Bridges
    if (showBridges && activeTab !== 'evacuate') {
      BRIDGES.forEach((brg) => {
        const res = deriveBridgeStatus(brg, currentFrame, allFrames);
        const color = res.status === 'CLOSED' ? '#E2461F' : res.status === 'AVOID' ? '#E0A526' : '#6E8B74';

        const icon = L.divIcon({
          className: '',
          html: `
            <div style="display:flex; align-items:center; gap:4px; cursor:pointer;">
              <div style="width:0; height:0; border-left:8px solid transparent; border-right:8px solid transparent; border-bottom:14px solid ${color}; filter:drop-shadow(0 0 2px #000);"></div>
              <span style="font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:600; color:#E6E2D3; background:#1A2226; border:1px solid #2E3B40; padding:1px 3px; white-space:nowrap;">
                ${brg.name.split(' ')[0]}
              </span>
            </div>
          `,
          iconSize: [90, 18],
          iconAnchor: [8, 9],
        });

        const m = L.marker([brg.lat, brg.lon], { icon }).addTo(group);
        m.on('click', () => {
          setSelectedBridge(brg);
        });
      });
    }

    // 3. Infrastructure Assets
    if (showInfra || activeTab === 'protect') {
      const evaluated = evaluateAssets(INITIAL_ASSETS, currentFrame, allFrames);
      evaluated.forEach((asset: EvaluatedAsset) => {
        const isHighlight = selectedAssetId === asset.id;
        const color = asset.verdict === 'NO' ? '#E2461F' : asset.verdict === 'PARTLY' ? '#E0A526' : '#6E8B74';

        const icon = L.divIcon({
          className: '',
          html: `
            <div style="display:flex; align-items:center; gap:4px; cursor:pointer;">
              <div style="width:${isHighlight ? 16 : 12}px; height:${isHighlight ? 16 : 12}px; background:${color}; border:${isHighlight ? 2.5 : 1.5}px solid #E6E2D3; transform:rotate(45deg);"></div>
              <span style="font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:${isHighlight ? 700 : 500}; color:#E6E2D3; background:${isHighlight ? '#2E3B40' : '#1A2226'}; border:1px solid #2E3B40; padding:0 3px; white-space:nowrap;">
                ${asset.name.split(' ')[0]}
              </span>
            </div>
          `,
          iconSize: [80, 16],
          iconAnchor: [6, 8],
        });

        L.marker([asset.lat, asset.lon], { icon }).addTo(group);
        if (isHighlight) {
          map.panTo([asset.lat, asset.lon], { animate: true });
        }
      });
    }
  }, [currentFrame, allFrames, showBridges, showShelters, showInfra, activeTab, selectedAssetId]);

  return (
    <div className={`relative survey-map flex flex-col border-2 border-rule bg-gauge-room overflow-hidden ${className}`}>
      {/* Top Controls Header (if enabled) */}
      {showControls && (
        <div className="bg-gauge-panel p-2.5 border-b-2 border-rule flex flex-col gap-2 shrink-0 z-10">
          <div className="flex items-center justify-between font-mono text-xs text-offwhite">
            <span className="font-bold">
              {activeTab === 'evacuate'
                ? 'EVACUATION PASSAGEWAY MAP'
                : activeTab === 'protect'
                ? 'CRITICAL INFRASTRUCTURE REACHES'
                : t('mapHeading')}
            </span>
            <span className="text-secondary">WGS84 · EPSG:4326</span>
          </div>

          {/* Time Chips (Flipbook steps) */}
          <div className="flex items-center justify-between bg-gauge-room p-1.5 border border-rule">
            <span className="font-mono text-[11px] text-secondary uppercase">TIMESTEP:</span>
            <div className="flex gap-1">
              {availableTimesteps.map((tMin, idx) => {
                const isSelected = idx === frameIndex;
                const label = tMin === 0 ? 'NOW' : `+${tMin}M`;

                return (
                  <button
                    key={tMin}
                    type="button"
                    onClick={() => setFrameIndex(idx)}
                    className={`min-h-[32px] px-2 py-0.5 font-mono text-xs font-bold border border-rule transition-colors ${
                      isSelected
                        ? 'bg-lichen text-gauge-room font-extrabold'
                        : 'bg-gauge-panel text-secondary hover:text-offwhite hover:bg-gauge-room'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Map Leaflet Container */}
      <div className="relative flex-1 w-full min-h-[350px]">
        <div
          ref={mapContainerRef}
          className="w-full h-full cursor-crosshair"
          style={{ cursor: 'crosshair' }}
        />

        {/* Marginal Map Legend Swatch */}
        <div className="absolute bottom-2 left-2 z-[500] bg-gauge-room/95 border border-rule p-2 font-mono text-[10px] text-offwhite flex flex-col gap-1 max-w-[200px] select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 bg-[#E2461F] border border-rule inline-block" />
            <span className="truncate">{t('legendCurrentExtent')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 bg-[#E0A526]/50 border border-rule inline-block border-dashed" />
            <span className="truncate">{t('legendAlertBuffer')}</span>
          </div>
        </div>
      </div>

      {/* Layer Toggle Strip in Footer */}
      {showControls && (
        <div className="grid grid-cols-4 border-t border-rule bg-gauge-room text-[11px] font-mono shrink-0">
          <button
            type="button"
            onClick={() => setShowDangerZones((v) => !v)}
            className={`p-1.5 border-r border-rule text-center transition-colors ${
              showDangerZones ? 'bg-gauge-panel text-offwhite font-bold border-b-2 border-b-lichen' : 'text-secondary hover:text-offwhite'
            }`}
          >
            DANGER {showDangerZones ? '■' : '□'}
          </button>
          <button
            type="button"
            onClick={() => setShowBridges((v) => !v)}
            className={`p-1.5 border-r border-rule text-center transition-colors ${
              showBridges ? 'bg-gauge-panel text-offwhite font-bold border-b-2 border-b-lichen' : 'text-secondary hover:text-offwhite'
            }`}
          >
            BRIDGES {showBridges ? '■' : '□'}
          </button>
          <button
            type="button"
            onClick={() => setShowShelters((v) => !v)}
            className={`p-1.5 border-r border-rule text-center transition-colors ${
              showShelters ? 'bg-gauge-panel text-offwhite font-bold border-b-2 border-b-lichen' : 'text-secondary hover:text-offwhite'
            }`}
          >
            SHELTERS {showShelters ? '■' : '□'}
          </button>
          <button
            type="button"
            onClick={() => setShowInfra((v) => !v)}
            className={`p-1.5 text-center transition-colors ${
              showInfra ? 'bg-gauge-panel text-offwhite font-bold border-b-2 border-b-lichen' : 'text-secondary hover:text-offwhite'
            }`}
          >
            INFRA {showInfra ? '■' : '□'}
          </button>
        </div>
      )}

      {/* Bridge Detail Sheet */}
      <Sheet
        isOpen={Boolean(selectedBridge)}
        onClose={() => setSelectedBridge(null)}
        title={selectedBridge?.name || ''}
        subtitle={t('bridgeDetails')}
      >
        {selectedBridge && currentFrame && (
          <div className="flex flex-col gap-4">
            <BridgeNotice
              bridge={selectedBridge}
              statusResult={deriveBridgeStatus(selectedBridge, currentFrame, allFrames)}
              isDetailed={true}
              onRouteAround={(brg) => {
                setSelectedBridge(null);
                if (onNavigateToEvacuate) {
                  onNavigateToEvacuate(brg.id);
                }
              }}
            />
          </div>
        )}
      </Sheet>
    </div>
  );
};
