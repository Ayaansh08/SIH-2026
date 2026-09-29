import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useScenario } from '../../context/ScenarioContext';
import { useLang } from '../../i18n/useLang';
import { BRIDGES } from '../../data/bridges';
import { EVAC_NODES } from '../../data/graph';
import { INITIAL_ASSETS, evaluateAssets } from '../../data/assets';
import { deriveBridgeStatus, bufferPolygonRing, type Bridge } from '../../lib/geo';
import { BridgeNotice } from './BridgeNotice';
import { Sheet } from '../lightswind/Sheet';
import { MAP_CONFIG } from '../../config/map';

interface MapTabProps {
  onNavigateToEvacuate?: (bridgeId?: string) => void;
}

export const MapTab: React.FC<MapTabProps> = ({ onNavigateToEvacuate }) => {
  const { currentFrame, allFrames, frameIndex, setFrameIndex, availableTimesteps } = useScenario();
  const { t } = useLang();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const inundationLayerRef = useRef<L.Polygon | null>(null);
  const bufferLayerRef = useRef<L.Polygon | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Layer toggles
  const [showDangerZones, setShowDangerZones] = useState(true);
  const [showBridges, setShowBridges] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showInfra, setShowInfra] = useState(true);

  // Selected Bridge for Sheet
  const [selectedBridge, setSelectedBridge] = useState<Bridge | null>(null);

  // Initialize Leaflet Map (Light Survey mode)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [27.35, 88.55],
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

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Inundation Polygon and 150m High-Alert Buffer
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

    // 150m High-Alert Buffer
    const bufferRing = bufferPolygonRing(ring, 0.0018);
    const bufferLatLngs: [number, number][] = bufferRing.map((c) => [c[1], c[0]]);

    // Buffer layer (lighter sparse hatch)
    const bufPoly = L.polygon(bufferLatLngs, {
      color: '#E0A526',
      weight: 1.5,
      dashArray: '4 4',
      fillColor: '#E0A526',
      fillOpacity: 0.18,
    }).addTo(map);
    bufferLayerRef.current = bufPoly;

    // Core Inundation layer (vermilion hatch)
    const poly = L.polygon(latLngs, {
      color: '#E2461F',
      weight: 2,
      fillColor: '#E2461F',
      fillOpacity: 0.38,
      className: 'hatch-pattern',
    }).addTo(map);
    inundationLayerRef.current = poly;
  }, [currentFrame, showDangerZones]);

  // Update Markers (Shelters, Bridges, Infrastructure)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markersLayerRef.current;
    if (!map || !group || !currentFrame) return;

    group.clearLayers();

    // 1. Shelters (Filled Square)
    if (showShelters) {
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

    // 2. Bridges (Triangle with Status Color)
    if (showBridges) {
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

    // 3. Infrastructure Assets (Diamond with Verdict Color)
    if (showInfra) {
      const evaluated = evaluateAssets(INITIAL_ASSETS, currentFrame, allFrames);
      evaluated.forEach((asset) => {
        const color = asset.verdict === 'NO' ? '#E2461F' : asset.verdict === 'PARTLY' ? '#E0A526' : '#6E8B74';

        const icon = L.divIcon({
          className: '',
          html: `
            <div style="display:flex; align-items:center; gap:4px; cursor:pointer;">
              <div style="width:12px; height:12px; background:${color}; border:1.5px solid #E6E2D3; transform:rotate(45deg);"></div>
              <span style="font-family:'IBM Plex Mono',monospace; font-size:10px; color:#E6E2D3; background:#1A2226; border:1px solid #2E3B40; padding:0 3px; white-space:nowrap;">
                ${asset.name.split(' ')[0]}
              </span>
            </div>
          `,
          iconSize: [80, 16],
          iconAnchor: [6, 8],
        });

        L.marker([asset.lat, asset.lon], { icon }).addTo(group);
      });
    }
  }, [currentFrame, allFrames, showBridges, showShelters, showInfra]);

  return (
    <div className="flex flex-col gap-4 select-none">
      {/* Title Header */}
      <div className="bg-gauge-panel p-3 border-2 border-rule flex items-center justify-between">
        <span className="font-mono font-bold text-xs text-offwhite uppercase tracking-wider">
          {t('mapHeading')}
        </span>
        <span className="font-mono text-xs text-secondary">
          WGS84 · EPSG:4326
        </span>
      </div>

      {/* Layer Toggle Chips */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setShowDangerZones((v) => !v)}
          className={`min-h-[44px] p-2 border-2 border-rule font-mono text-xs flex items-center justify-between transition-colors ${
            showDangerZones ? 'bg-gauge-panel text-offwhite font-bold border-lichen' : 'bg-gauge-room text-secondary'
          }`}
        >
          <span>{t('layerDangerZones')}</span>
          <span className="font-bold">{showDangerZones ? '■ ON' : '□ OFF'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowBridges((v) => !v)}
          className={`min-h-[44px] p-2 border-2 border-rule font-mono text-xs flex items-center justify-between transition-colors ${
            showBridges ? 'bg-gauge-panel text-offwhite font-bold border-lichen' : 'bg-gauge-room text-secondary'
          }`}
        >
          <span>{t('layerBridges')}</span>
          <span className="font-bold">{showBridges ? '■ ON' : '□ OFF'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowShelters((v) => !v)}
          className={`min-h-[44px] p-2 border-2 border-rule font-mono text-xs flex items-center justify-between transition-colors ${
            showShelters ? 'bg-gauge-panel text-offwhite font-bold border-lichen' : 'bg-gauge-room text-secondary'
          }`}
        >
          <span>{t('layerShelters')}</span>
          <span className="font-bold">{showShelters ? '■ ON' : '□ OFF'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowInfra((v) => !v)}
          className={`min-h-[44px] p-2 border-2 border-rule font-mono text-xs flex items-center justify-between transition-colors ${
            showInfra ? 'bg-gauge-panel text-offwhite font-bold border-lichen' : 'bg-gauge-room text-secondary'
          }`}
        >
          <span>{t('layerInfra')}</span>
          <span className="font-bold">{showInfra ? '■ ON' : '□ OFF'}</span>
        </button>
      </div>

      {/* Time Chips (Flipbook steps) */}
      <div className="flex items-center justify-between bg-gauge-panel p-2 border-2 border-rule">
        <span className="font-mono text-xs text-secondary uppercase">TIMESTEP:</span>
        <div className="flex gap-1.5">
          {availableTimesteps.map((tMin, idx) => {
            const isSelected = idx === frameIndex;
            const label = tMin === 0 ? 'NOW' : `+${tMin}M`;

            return (
              <button
                key={tMin}
                type="button"
                onClick={() => setFrameIndex(idx)}
                className={`min-h-[40px] px-2.5 py-1 font-mono text-xs font-bold border border-rule transition-colors ${
                  isSelected
                    ? 'bg-lichen text-gauge-room font-extrabold'
                    : 'bg-gauge-room text-secondary hover:text-offwhite hover:bg-gauge-panel'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative border-2 border-rule bg-gauge-room h-[380px] overflow-hidden">
        <div
          ref={mapContainerRef}
          className="w-full h-full cursor-crosshair"
          style={{ cursor: 'crosshair' }}
        />

        {/* Marginal Map Legend Swatch */}
        <div className="absolute bottom-2 left-2 z-[500] bg-gauge-room/95 border border-rule p-2 font-mono text-[10px] text-offwhite flex flex-col gap-1 max-w-[200px]">
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
