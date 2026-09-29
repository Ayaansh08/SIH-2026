import { Link } from 'react-router-dom';

export const CitizenStubPage = () => {
  return (
    <div className="min-h-screen w-full bg-[#E9E4D3] text-[#1E2723] flex flex-col justify-between p-6 sm:p-12 font-sans select-none">
      {/* Header Sheet Title Block */}
      <header className="border-b-2 border-[#DDD6C0] pb-4 flex items-center justify-between">
        <div>
          <div className="font-mono text-scale-11 tracking-widest text-[#7D8A80] uppercase">
            TEESTAWATCH · PUBLIC DISASTER ADVISORY
          </div>
          <h1 className="font-display font-extrabold text-scale-44 uppercase tracking-tight text-[#1E2723]">
            CITIZEN ALERT LAYER
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="survey-stamp text-[#6E8B74] border-[#6E8B74]">PHASE 2 WORKSTREAM</span>
          <Link
            to="/console"
            className="px-3 py-1.5 border border-[#1E2723] font-mono text-scale-11 hover:bg-[#DDD6C0] transition-colors"
          >
            ← RETURN TO CONSOLE
          </Link>
        </div>
      </header>

      {/* Main Narrative */}
      <main className="my-auto max-w-3xl py-8 flex flex-col gap-6">
        <div className="bg-[#DDD6C0] p-6 border-l-4 border-l-[#E0A526] flex flex-col gap-3">
          <div className="font-mono text-scale-11 text-[#7D8A80] uppercase">
            SPECIFICATION MILESTONE: PHASE 2 RESERVED
          </div>
          <h2 className="font-display font-bold text-scale-28 text-[#1E2723] uppercase">
            Mobile-First Warning & Community Evacuation Interface
          </h2>
          <p className="text-scale-15 leading-relaxed text-[#1E2723]/90">
            This module provides lightweight, offline-resilient flood warnings, river crossing
            danger alerts, and safe contour evacuation routes for populations residing along the
            Chungthang, Mangan, Singtam, Rangpo, Teesta Bazar, and Sevoke reaches.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-[#DDD6C0] p-4 bg-white/40">
            <span className="font-mono text-scale-11 text-[#7D8A80] block mb-1">CAPABILITY 01</span>
            <h3 className="font-display font-bold text-scale-20 uppercase">SMS & Mesh Audio Warning</h3>
            <p className="text-scale-13 text-[#7D8A80] mt-1">
              Automated trigger cascades linked to upstream gauge threshold exceedances and verified
              precursor signals.
            </p>
          </div>
          <div className="border border-[#DDD6C0] p-4 bg-white/40">
            <span className="font-mono text-scale-11 text-[#7D8A80] block mb-1">CAPABILITY 02</span>
            <h3 className="font-display font-bold text-scale-20 uppercase">Contour Safe-Zone Maps</h3>
            <p className="text-scale-13 text-[#7D8A80] mt-1">
              Visual topographic survey contours illustrating inundation limit envelopes and high-ground
              refuge assembly centers.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#DDD6C0] pt-4 font-mono text-scale-11 text-[#7D8A80] flex items-center justify-between">
        <span>TEESTA BASIN AUTHORITY · CIVIL DEFENSE</span>
        <span>AESTHETIC REFERENCE: SURVEY SHEET (LIGHT "PAPER")</span>
      </footer>
    </div>
  );
};
