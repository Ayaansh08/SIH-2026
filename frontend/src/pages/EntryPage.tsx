import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DotGrid } from '../components/reactbits/DotGrid';
import { AppHeader } from '../ui/AppHeader';
import { Wordmark } from '../components/Wordmark';

const CORRIDOR_TICKER = [
  'CHUNGTHANG 27.60°N 88.65°E · 8.4M STAGE · ALERT',
  'MANGAN GORGE 27.48°N 88.59°E · 7.1M STAGE · WATCH',
  'DIKCHU DAM 27.40°N 88.55°E · 6.1M STAGE · ALERT',
  'SINGTAM BRIDGE 27.23°N 88.50°E · 4.8M STAGE · WATCH',
  'RANGPO BARRIER 27.18°N 88.53°E · 3.2M STAGE · NORMAL',
  'TEESTA BAZAR 27.08°N 88.47°E · 2.5M STAGE · NORMAL',
  'SEVOKE CORRIDOR 26.88°N 88.47°E · 1.8M STAGE · NORMAL',
];

export const EntryPage = () => {
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % CORRIDOR_TICKER.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-gauge-room text-offwhite gauge-grain flex flex-col justify-between select-none">
      {/* Page-corner registration crosses */}
      <span className="corner-cross corner-cross--tl">┼</span>
      <span className="corner-cross corner-cross--tr">┼</span>
      <span className="corner-cross corner-cross--bl">┼</span>
      <span className="corner-cross corner-cross--br">┼</span>

      {/* DotGrid background */}
      <DotGrid gap={36} dotSize={1.2} opacity={0.18} />

      {/* Header */}
      <AppHeader routeTag="HOME" />
      <div className="double-rule-h" />

      {/* Full-width Live Gauge Ticker */}
      <div className="relative z-10 w-full bg-gauge-panel border-b border-rule px-4 sm:px-8 py-2 flex items-center justify-between font-mono text-scale-13 text-secondary">
        <div className="flex items-center gap-3 truncate">
          <span className="text-lichen font-bold uppercase tracking-wider shrink-0">
            ● LIVE GAUGE TICKER:
          </span>
          <span className="text-offwhite font-medium truncate">
            {CORRIDOR_TICKER[tickerIndex]}
          </span>
        </div>
        <span className="hidden sm:inline text-xs text-secondary shrink-0 ml-4">
          CYCLE: 3.5S · 7 ACTIVE REACHES
        </span>
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 flex flex-col justify-center gap-8">
        {/* Hero 12-Col Grid: Left Intro / Right Survey Inset Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left 7 cols: Title Block */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <span className="text-scale-14 text-secondary font-sans tracking-wide uppercase">
              Flood digital twin · Teesta basin
            </span>

            <div className="text-offwhite">
              <Wordmark size="hero" asLink={false} />
            </div>

            <p className="text-scale-20 font-sans text-secondary leading-tight">
              Simulate. Verify. Act. Recover.
            </p>

            <p className="text-scale-15 font-sans text-offwhite/90 leading-relaxed max-w-xl">
              Dam-break and glacial-lake flood simulation that turns hydrodynamic model output into
              infrastructure, evacuation and community resilience decisions across the Teesta corridor.
            </p>
          </div>

          {/* Right 5 cols: Survey Inset Mini-Map */}
          <div className="lg:col-span-5 bg-gauge-panel border-2 border-rule p-4 flex flex-col gap-2 relative">
            <div className="flex items-center justify-between border-b border-rule pb-2 font-mono text-xs text-secondary">
              <span className="font-bold text-offwhite">CORRIDOR SURVEY INSET // REACH 01–07</span>
              <span>1:250,000</span>
            </div>

            {/* Inset SVG Graphic */}
            <div className="relative w-full h-44 bg-gauge-room border border-rule flex items-center justify-center overflow-hidden p-2">
              <svg viewBox="0 0 300 130" className="w-full h-full overflow-visible">
                {/* Survey Grid Coordinates */}
                <line x1="0" y1="65" x2="300" y2="65" stroke="#2E3B40" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="150" y1="0" x2="150" y2="130" stroke="#2E3B40" strokeWidth="0.5" strokeDasharray="3 3" />

                {/* River S-Curve Corridor */}
                <path
                  d="M 20 20 Q 80 50 140 35 T 220 85 T 280 110"
                  fill="none"
                  stroke="#6E8B74"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* 8 Bridge Ticks along corridor */}
                {[
                  [20, 20, 'Chungthang'],
                  [65, 42, 'Mangan'],
                  [110, 38, 'Dikchu'],
                  [140, 35, 'Makha'],
                  [180, 55, 'Singtam'],
                  [220, 85, 'Rangpo'],
                  [250, 98, 'Teesta Bazar'],
                  [280, 110, 'Sevoke'],
                ].map(([x, y], i) => (
                  <g key={i}>
                    <circle cx={x as number} cy={y as number} r="3" fill="#11171A" stroke="#7D8A80" strokeWidth="1.5" />
                    {i === 2 && (
                      /* Highlighted WATCH / ALERT Station */
                      <g>
                        <circle cx={x as number} cy={y as number} r="6" fill="none" stroke="#E0A526" strokeWidth="1.5" strokeDasharray="2 2" />
                        <text x={(x as number) + 8} y={(y as number) - 4} fill="#E0A526" fontSize="9" fontFamily="IBM Plex Mono" fontWeight="bold">
                          DIKCHU [WATCH]
                        </text>
                      </g>
                    )}
                  </g>
                ))}

                {/* Start & End Labels */}
                <text x="25" y="16" fill="#A3AEA5" fontSize="8" fontFamily="IBM Plex Mono">SOUTH LHONAK (0 KM)</text>
                <text x="210" y="125" fill="#A3AEA5" fontSize="8" fontFamily="IBM Plex Mono">SEVOKE PLAIN (129 KM)</text>
              </svg>

              {/* Scale bar in bottom right */}
              <div className="absolute bottom-1 right-2 font-mono text-[9px] text-secondary flex items-center gap-1">
                <span>0</span>
                <span className="w-8 h-[2px] bg-secondary inline-block" />
                <span>25 KM</span>
              </div>
            </div>

            <div className="flex items-center justify-between font-mono text-[10px] text-secondary pt-1">
              <span>DATUM: WGS84 · EPSG:32644</span>
              <span className="text-lichen">● 8 STATIONS MONITORED</span>
            </div>
          </div>
        </div>

        {/* 12-Column Entry Cards (8 / 4 Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Card 1: Authority Command Console (8 cols) */}
          <Link
            to="/console"
            className="md:col-span-8 bg-gauge-panel border-2 border-rule hover:border-lichen p-6 sm:p-8 flex flex-col justify-between group transition-colors shadow-2xl relative"
          >
            <span className="absolute top-2 right-2 font-mono text-xs text-secondary">┼</span>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="survey-stamp text-lichen border-lichen">AUTHORITY ACCESS</span>
                <span className="font-mono text-xs text-secondary">DISPATCH DESK 01</span>
              </div>
              <h2 className="font-display font-extrabold text-3xl sm:text-scale-44 text-offwhite uppercase tracking-tight group-hover:text-lichen transition-colors">
                Command Console
              </h2>
              <p className="font-sans text-scale-15 text-secondary leading-relaxed max-w-2xl">
                Surveillance desk for emergency authorities, dam safety inspectors, and state
                disaster authorities. Latin Hypercube sweeps, hydrodynamic wave propagation,
                gauge ledgers, and precursor telemetry feeds.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-rule flex items-center justify-between font-mono text-xs">
              <span className="text-lichen font-bold group-hover:underline flex items-center gap-2">
                <span>ENTER GAUGE ROOM CONSOLE</span>
                <span>→</span>
              </span>
              <span className="text-secondary">DARK GAUGE ROOM PALETTE</span>
            </div>
          </Link>

          {/* Card 2: Pravah-X Citizen (4 cols) — in Dark Gauge Palette */}
          <Link
            to="/citizen"
            className="md:col-span-4 bg-gauge-panel text-offwhite border-2 border-rule hover:border-lichen p-6 sm:p-8 flex flex-col justify-between group transition-colors shadow-xl relative"
          >
            <span className="absolute top-2 right-2 font-mono text-xs text-secondary">┼</span>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="survey-stamp text-lichen border-lichen bg-gauge-room">CITIZEN ADVISORY</span>
                <span className="font-mono text-xs text-secondary">PHASE 2</span>
              </div>
              <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-offwhite uppercase tracking-tight group-hover:text-lichen transition-colors">
                PRAVAH-X CITIZEN
              </h3>
              <p className="font-sans text-sm text-secondary leading-relaxed">
                Emergency evacuation routing, reach status, live bridge closure telemetry, and Schedule VII CSR asset protection.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-rule flex items-center justify-between font-mono text-xs">
              <span className="text-lichen font-bold group-hover:underline flex items-center gap-1">
                <span>OPEN CITIZEN VIEW</span>
                <span>→</span>
              </span>
              <span className="text-secondary">DARK THEME</span>
            </div>
          </Link>
        </div>
      </main>

      {/* Engineering Stamp Footer */}
      <footer className="relative z-10 border-t-2 border-rule px-4 sm:px-8 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-scale-13 text-secondary bg-gauge-room">
        <div>
          <span className="block text-[10px] text-secondary">PROJECTION:</span>
          <span className="text-offwhite">UTM ZONE 45N / EPSG:32644</span>
        </div>
        <div>
          <span className="block text-[10px] text-secondary">HYDRODYNAMIC COUPLING:</span>
          <span className="text-lichen font-medium">SURROGATE READY</span>
        </div>
        <div>
          <span className="block text-[10px] text-secondary">PLATFORM:</span>
          <span className="text-offwhite">PRAVAH-X · SIH 2026</span>
        </div>
        <div className="text-right">
          <span className="block text-[10px] text-secondary">TELEMETRY STATUS:</span>
          <span className="text-lichen font-medium">CORRIDOR SECURE</span>
        </div>
      </footer>
    </div>
  );
};
