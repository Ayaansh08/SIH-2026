import React, { useState, useMemo } from 'react';
import { useLang } from '../i18n/useLang';
import { useScenario } from '../context/ScenarioContext';
import { LOCATIONS, type VillageLocation } from '../data/locations';
import { StatusTab } from '../components/citizen/StatusTab';
import { MapTab } from '../components/citizen/MapTab';
import { EvacuateTab } from '../components/citizen/EvacuateTab';
import { ProtectTab } from '../components/citizen/ProtectTab';
import { CitizenMap } from '../components/citizen/CitizenMap';
import { SparkContainer, useSpark } from '../components/citizen/ClickSpark';
import { Sheet } from '../components/lightswind/Sheet';
import { useToast } from '../components/lightswind/Toast';
import { AppHeader } from '../ui/AppHeader';
import { solveDijkstra } from '../lib/dijkstra';
import { BRIDGES } from '../data/bridges';
import { DotGrid } from '../components/reactbits/DotGrid';
import type { EvaluatedAsset } from '../data/assets';

type CitizenTabId = 'status' | 'map' | 'evacuate' | 'protect';

const TAB_STORAGE_KEY = 'pravahx:citizen_tab';
const LOC_STORAGE_KEY = 'pravahx:citizen_location';

export const CitizenPage: React.FC = () => {
  const { lang, setLang, t } = useLang();
  const { currentScenario, currentFrame, allFrames, breachLikelihood } = useScenario();
  const { sparks, fireSpark, handleSparkComplete } = useSpark();
  const { addToast } = useToast();

  const isHindi = lang === 'hi';

  // Active Tab State
  const [activeTab, setActiveTab] = useState<CitizenTabId>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(TAB_STORAGE_KEY) as CitizenTabId;
      if (['status', 'map', 'evacuate', 'protect'].includes(saved)) {
        return saved;
      }
    }
    return 'status';
  });

  const handleTabChange = (tabId: CitizenTabId) => {
    setActiveTab(tabId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(TAB_STORAGE_KEY, tabId);
    }
  };

  // Selected Location
  const [selectedLocation, setSelectedLocation] = useState<VillageLocation>(() => {
    if (typeof window !== 'undefined') {
      const savedId = localStorage.getItem(LOC_STORAGE_KEY);
      const found = LOCATIONS.find((l) => l.id === savedId);
      if (found) return found;
    }
    return LOCATIONS[3]; // Singtam default
  });

  const [isLocationSheetOpen, setIsLocationSheetOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [isLocatingGps, setIsLocatingGps] = useState(false);

  // Selected Asset on Protect tab
  const [selectedAssetId, setSelectedAssetId] = useState<string | undefined>();

  const handleSelectLocation = (loc: VillageLocation) => {
    setSelectedLocation(loc);
    setIsLocationSheetOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOC_STORAGE_KEY, loc.id);
    }
    addToast({
      title: 'LOCATION UPDATED',
      description: `Active reach set to ${loc.name}.`,
      type: 'INFO',
    });
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      addToast({
        title: 'GPS UNAVAILABLE',
        description: t('locationPermissionDenied'),
        type: 'WATCH',
      });
      return;
    }

    setIsLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingGps(false);
        const { latitude, longitude } = pos.coords;
        let closest = LOCATIONS[0];
        let minDist = Infinity;
        LOCATIONS.forEach((l) => {
          const d = Math.hypot(l.lat - latitude, l.lon - longitude);
          if (d < minDist) {
            minDist = d;
            closest = l;
          }
        });
        handleSelectLocation(closest);
      },
      () => {
        setIsLocatingGps(false);
        addToast({
          title: t('usingDefault'),
          description: t('locationPermissionDenied'),
          type: 'WATCH',
        });
      },
      { timeout: 8000 }
    );
  };

  const filteredLocations = LOCATIONS.filter(
    (l) =>
      l.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
      l.nameHi.includes(locationSearch) ||
      l.district.toLowerCase().includes(locationSearch.toLowerCase())
  );

  // Derived Dijkstra Route for Evacuate Map Sync
  const isDanger = breachLikelihood >= 75;
  const currentRoute = useMemo(() => {
    return solveDijkstra(
      selectedLocation.nodeId,
      isDanger ? 'DURING' : 'BEFORE',
      currentFrame,
      allFrames,
      BRIDGES
    );
  }, [selectedLocation.nodeId, isDanger, currentFrame, allFrames]);

  const tabsList: { id: CitizenTabId; label: string; icon: string }[] = [
    { id: 'status', label: t('tabStatus'), icon: '■' },
    { id: 'map', label: t('tabMap'), icon: '▲' },
    { id: 'evacuate', label: t('tabEvacuate'), icon: '◆' },
    { id: 'protect', label: t('tabProtect'), icon: '✚' },
  ];

  return (
    <div
      data-theme="night"
      className="min-h-screen w-full bg-gauge-room text-offwhite flex flex-col justify-between selection:bg-lichen selection:text-gauge-room relative overflow-x-hidden font-sans"
    >
      {/* Spark Burst Container */}
      <SparkContainer sparks={sparks} onComplete={handleSparkComplete} />

      {/* Outer Margin Registration Marks */}
      <span className="fixed top-2 left-2 z-50 font-mono text-sm text-secondary pointer-events-none select-none">┼</span>
      <span className="fixed top-2 right-2 z-50 font-mono text-sm text-secondary pointer-events-none select-none">┼</span>
      <span className="fixed bottom-2 left-2 z-50 font-mono text-sm text-secondary pointer-events-none select-none">┼</span>
      <span className="fixed bottom-2 right-2 z-50 font-mono text-sm text-secondary pointer-events-none select-none">┼</span>

      {/* Drafting Paper Cross Grid on Large Desktop (>1440px) */}
      <div className="hidden 2xl:block absolute inset-0 pointer-events-none">
        <DotGrid gap={48} dotSize={1.5} opacity={0.12} />
      </div>

      {/* Universal Shared Header */}
      <AppHeader
        routeTag="CITIZEN"
        actions={
          <div className="flex border border-rule bg-gauge-room">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 font-mono text-xs font-bold transition-colors ${
                lang === 'en' ? 'bg-lichen text-gauge-room font-extrabold' : 'text-secondary hover:text-offwhite hover:bg-gauge-panel'
              }`}
              aria-label="English"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('hi')}
              className={`px-2.5 py-1 font-devanagari text-xs font-bold transition-colors border-l border-rule ${
                lang === 'hi' ? 'bg-lichen text-gauge-room font-extrabold' : 'text-secondary hover:text-offwhite hover:bg-gauge-panel'
              }`}
              aria-label="हिन्दी"
            >
              हिन्दी
            </button>
          </div>
        }
      />

      {/* Persistent Simulated Data Warning Strip */}
      <div className="w-full bg-gauge-panel text-secondary text-center py-1.5 px-4 font-mono text-[11px] tracking-wider uppercase border-b border-rule z-20">
        <span className="text-watch-amber font-semibold mr-1.5">⚠ NOTICE:</span>
        {t('simulatedWarning')}
      </div>

      {/* =========================================================================
          DESKTOP LAYOUT (≥1024px): 12-Column Sheet with Left Content + Sticky Map
         ========================================================================= */}
      <div className="hidden lg:block w-full max-w-[1440px] mx-auto px-6 py-6 flex-1">
        {/* Outer Neatline Border with Survey Sheet Margin Title Block */}
        <div className="border-2 border-rule bg-gauge-panel p-4 flex flex-col gap-4 shadow-2xl">
          {/* Survey Margin Top Strip */}
          <div className="border-b border-rule pb-2 flex items-center justify-between font-mono text-xs text-secondary">
            <div className="flex items-center gap-3">
              <span className="font-bold text-offwhite">SHEET: SIH-2026-TEESTA-QUADRANGLE</span>
              <span>·</span>
              <span>SERIES 1:50,000 (EASTERN HIMALAYA 4)</span>
            </div>
            <div className="flex items-center gap-3">
              <span>DATUM: WGS84 / EPSG:32644</span>
              <span>·</span>
              <span className="font-semibold text-lichen">
                RUN: {currentScenario.terrain_slope_class.toUpperCase()} (T+{currentFrame.timestep_minutes}M)
              </span>
            </div>
          </div>

          {/* 12-Column Grid Workspace */}
          <div className="grid grid-cols-12 gap-6 items-start">
            {/* Left 5 Columns: Top Tab Bar + Active Tab Content */}
            <div className="col-span-5 flex flex-col gap-4">
              {/* Horizontal Tab Row at Top of Column (3px top rule on active) */}
              <div className="grid grid-cols-4 border-2 border-rule bg-gauge-room">
                {tabsList.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleTabChange(tab.id)}
                      className={`min-h-[44px] py-2 px-1 font-mono text-xs uppercase tracking-wider transition-colors flex flex-col items-center justify-center border-r last:border-r-0 border-rule ${
                        isActive
                          ? 'bg-gauge-panel text-offwhite font-bold border-t-[3px] border-t-lichen -mt-[1px]'
                          : 'bg-gauge-room text-secondary hover:bg-gauge-panel hover:text-offwhite'
                      }`}
                    >
                      <span className="text-xs">{tab.icon}</span>
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Views */}
              <div className="flex flex-col gap-4">
                {activeTab === 'status' && (
                  <StatusTab
                    selectedLocationName={isHindi ? selectedLocation.nameHi : selectedLocation.name}
                    onOpenLocationPicker={() => setIsLocationSheetOpen(true)}
                  />
                )}

                {activeTab === 'map' && (
                  <MapTab
                    onNavigateToEvacuate={() => {
                      setActiveTab('evacuate');
                    }}
                  />
                )}

                {activeTab === 'evacuate' && (
                  <EvacuateTab
                    userNodeId={selectedLocation.nodeId}
                    onFireSpark={fireSpark}
                  />
                )}

                {activeTab === 'protect' && (
                  <ProtectTab
                    onFireSpark={fireSpark}
                    onSelectAsset={(asset: EvaluatedAsset) => setSelectedAssetId(asset.id)}
                    selectedAssetId={selectedAssetId}
                  />
                )}
              </div>
            </div>

            {/* Right 7 Columns: Sticky Full-Height Interactive Map */}
            <div className="col-span-7 sticky top-4" style={{ height: 'calc(100vh - 120px)' }}>
              <CitizenMap
                activeTab={activeTab}
                routeCoords={activeTab === 'evacuate' ? currentRoute.pathCoords : []}
                blockedSegments={activeTab === 'evacuate' ? currentRoute.blockedSegments : []}
                selectedAssetId={activeTab === 'protect' ? selectedAssetId : undefined}
                className="h-full w-full"
                showControls={true}
                onNavigateToEvacuate={() => setActiveTab('evacuate')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MOBILE LAYOUT (<1024px): Max ~480px Centered Sheet with Bottom Tab Bar
         ========================================================================= */}
      <div className="block lg:hidden w-full max-w-[480px] mx-auto px-4 py-4 flex-1 flex flex-col">
        {activeTab === 'status' && (
          <StatusTab
            selectedLocationName={isHindi ? selectedLocation.nameHi : selectedLocation.name}
            onOpenLocationPicker={() => setIsLocationSheetOpen(true)}
          />
        )}

        {activeTab === 'map' && (
          <MapTab
            onNavigateToEvacuate={() => {
              setActiveTab('evacuate');
            }}
          />
        )}

        {activeTab === 'evacuate' && (
          <EvacuateTab
            userNodeId={selectedLocation.nodeId}
            onFireSpark={fireSpark}
          />
        )}

        {activeTab === 'protect' && (
          <ProtectTab onFireSpark={fireSpark} />
        )}
      </div>

      {/* Mobile Margin Footer Title Block */}
      <footer className="block lg:hidden w-full max-w-[480px] mx-auto px-4 py-2 border-t border-rule font-mono text-[11px] text-secondary flex items-center justify-between select-none">
        <span>{t('sheetRef')}</span>
        <span>
          RUN #{currentScenario.terrain_slope_class.toUpperCase()} · T+{currentFrame.timestep_minutes}M
        </span>
      </footer>

      {/* Mobile Bottom Tab Bar (<1024px) */}
      <nav className="block lg:hidden w-full bg-gauge-room border-t-2 border-rule sticky bottom-0 z-40 select-none">
        <div className="max-w-[480px] mx-auto grid grid-cols-4">
          {tabsList.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`min-h-[48px] py-2 px-1 flex flex-col items-center justify-center font-mono text-xs uppercase tracking-wider transition-colors relative border-r last:border-r-0 border-rule ${
                  isActive
                    ? 'bg-gauge-panel text-offwhite font-bold border-t-[3px] border-t-lichen -mt-[1px]'
                    : 'bg-gauge-room text-secondary hover:bg-gauge-panel hover:text-offwhite'
                }`}
              >
                <span className="text-xs leading-none mb-0.5">{tab.icon}</span>
                <span className="text-[11px] leading-tight truncate w-full text-center">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Location Picker Sheet */}
      <Sheet
        isOpen={isLocationSheetOpen}
        onClose={() => setIsLocationSheetOpen(false)}
        title={t('selectLocation')}
        subtitle="GPS & REACH DISPATCH"
      >
        <div className="flex flex-col gap-4 font-mono text-scale-13 text-offwhite">
          <button
            type="button"
            onClick={handleUseGps}
            disabled={isLocatingGps}
            className="w-full py-3 px-4 bg-lichen text-gauge-room font-bold text-xs uppercase hover:bg-lichen/90 active:bg-lichen transition-colors border border-lichen flex items-center justify-center gap-2"
          >
            <span>🛰️</span>
            <span>{isLocatingGps ? 'LOCATING VIA GPS...' : t('useMyLocation')}</span>
          </button>

          <div className="flex flex-col gap-1">
            <input
              type="text"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              placeholder={t('searchLocationPlaceholder')}
              className="bg-gauge-room border border-rule p-2.5 font-mono text-sm text-offwhite focus:outline-none focus:ring-1 focus:ring-lichen placeholder:text-secondary/50"
            />
          </div>

          <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
            {filteredLocations.map((loc) => {
              const isSelected = selectedLocation.id === loc.id;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => handleSelectLocation(loc)}
                  className={`p-3 border border-rule text-left flex items-start justify-between transition-colors ${
                    isSelected ? 'bg-gauge-panel text-offwhite font-bold border-lichen' : 'bg-gauge-room hover:bg-gauge-panel text-offwhite'
                  }`}
                >
                  <div>
                    <div className="text-sm font-bold">
                      {isHindi ? loc.nameHi : loc.name}
                    </div>
                    <div className="text-xs text-secondary mt-0.5">
                      KM {loc.chainage_km} · {loc.district}
                    </div>
                  </div>
                  {isSelected && <span className="text-lichen font-bold">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      </Sheet>
    </div>
  );
};
