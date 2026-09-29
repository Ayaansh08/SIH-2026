import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DotGrid } from '../components/reactbits/DotGrid';
import { DecryptedText } from '../components/reactbits/DecryptedText';

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
    <div className="relative min-h-screen w-full bg-gauge-room text-offwhite gauge-grain flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* Background DotGrid */}
      <DotGrid gap={24} dotSize={1.5} />

      {/* Top Survey Sheet Header Bar */}
      <header className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between border-b border-rule pb-3 gap-2">
        <div className="flex items-center gap-4">
          <div className="survey-stamp text-lichen">SHEET SIH-2026-TEESTA</div>
          <span className="font-mono text-scale-11 text-contour">
            SERIES 1:50,000 · EASTERN HIMALAYAN BASIN 4
          </span>
        </div>
        <div className="flex items-center gap-4 text-scale-11 font-mono text-contour">
          <span>COORDINATE DATUM: WGS84</span>
          <span className="text-lichen">● TELEMETRY ACTIVE</span>
        </div>
      </header>

      {/* Centerpiece Main Block */}
      <main className="relative z-10 my-auto py-8 flex flex-col gap-6 max-w-5xl">
        {/* Title Block Box */}
        <div className="border-l-4 border-l-lichen pl-4 sm:pl-6 flex flex-col">
          <div className="text-scale-13 font-mono tracking-widest text-contour uppercase">
            HYDROLOGY & DISASTER MANAGEMENT PLATFORM
          </div>
          <h1 className="font-display font-extrabold text-scale-44 sm:text-scale-88 tracking-tight uppercase text-offwhite leading-none mt-1">
            <DecryptedText text="TEESTAWATCH" speed={25} maxIterations={12} />
          </h1>
          <p className="font-sans text-scale-15 text-contour max-w-2xl mt-2 leading-relaxed">
            Dam-break and glacial lake outburst flood (GLOF) hydrodynamic early-warning system
            spanning the Teesta River Basin corridor from South Lhonak/Chungthang (Sikkim) down to
            Sevoke (North Bengal).
          </p>
        </div>

        {/* Live Coordinate Ticker */}
        <div className="bg-gauge-panel border border-rule px-4 py-2 flex items-center justify-between font-mono text-scale-11 text-contour">
          <div className="flex items-center gap-3">
            <span className="text-danger-vermilion font-bold">LIVE GAUGE TICKER:</span>
            <span className="text-offwhite font-medium">{CORRIDOR_TICKER[tickerIndex]}</span>
          </div>
          <span className="hidden sm:inline text-[10px]">T-CYCLE: 3.5S</span>
        </div>

        {/* Two Asymmetric Entry Gateways */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch pt-2">
          {/* Gateway 1: Authority Command Console (BIG: 8 cols) */}
          <Link
            to="/console"
            className="md:col-span-8 bg-gauge-panel border-2 border-rule hover:border-lichen p-6 flex flex-col justify-between group transition-colors shadow-2xl relative overflow-hidden"
          >
            <span className="absolute top-2 right-2 font-mono text-scale-11 text-contour">┼</span>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="survey-stamp text-lichen">AUTHORITY ACCESS</span>
                <span className="font-mono text-scale-11 text-contour">DISPATCH GATEWAY 01</span>
              </div>
              <h2 className="font-display font-extrabold text-scale-28 sm:text-scale-44 text-offwhite uppercase tracking-tight group-hover:text-lichen transition-colors">
                COMMAND CONSOLE
              </h2>
              <p className="font-sans text-scale-13 text-contour leading-relaxed max-w-lg">
                Surveillance desk for emergency authorities, dam safety inspectors, and state
                disaster authorities. Latin Hypercube parameter sweeps, interactive hydrodynamic
                wave propagation, corridor gauge ledgers, and precursor seismic/lake anomaly feeds.
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-rule flex items-center justify-between font-mono text-scale-11">
              <span className="text-lichen font-bold group-hover:underline flex items-center gap-2">
                <span>ENTER GAUGE ROOM CONSOLE</span>
                <span>→</span>
              </span>
              <span className="text-contour">DARK INTERFACE [HIGH RESOLUTION]</span>
            </div>
          </Link>

          {/* Gateway 2: Citizen Alerts (SMALLER: 4 cols) */}
          <Link
            to="/citizen"
            className="md:col-span-4 bg-[#1E2629] border border-rule hover:border-contour p-5 flex flex-col justify-between group transition-colors relative"
          >
            <span className="absolute top-2 right-2 font-mono text-scale-11 text-contour">┼</span>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="survey-stamp text-contour">PUBLIC WARNING</span>
                <span className="font-mono text-scale-11 text-contour">PHASE 2</span>
              </div>
              <h3 className="font-display font-bold text-scale-28 text-offwhite uppercase tracking-tight group-hover:text-offwhite">
                CITIZEN ALERTS
              </h3>
              <p className="font-sans text-scale-13 text-contour leading-relaxed">
                Mobile-first evacuation corridor routing and localized warning broadcasts for riverine
                residents and downstream communities.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-rule flex items-center justify-between font-mono text-scale-11">
              <span className="text-contour font-medium group-hover:text-offwhite flex items-center gap-1">
                <span>STUB OVERVIEW</span>
                <span>→</span>
              </span>
              <span className="text-[10px] text-contour">LIGHT PAPER LAYER</span>
            </div>
          </Link>
        </div>
      </main>

      {/* Bottom Title Block Engineering Stamp Footer */}
      <footer className="relative z-10 border-t-2 border-rule pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-scale-11 text-contour bg-gauge-room">
        <div>
          <span className="block text-[9px] text-contour">PROJECTION:</span>
          <span className="text-offwhite">UTM ZONE 45N / EPSG:32644</span>
        </div>
        <div>
          <span className="block text-[9px] text-contour">SPH / DELFT3D COUPLING:</span>
          <span className="text-lichen">SURROGATE READY</span>
        </div>
        <div>
          <span className="block text-[9px] text-contour">DEVELOPED FOR:</span>
          <span className="text-offwhite">SMART INDIA HACKATHON 2026</span>
        </div>
        <div className="text-right">
          <span className="block text-[9px] text-contour">SECURITY STATUS:</span>
          <span className="text-lichen">STATION LINK SECURE</span>
        </div>
      </footer>
    </div>
  );
};
