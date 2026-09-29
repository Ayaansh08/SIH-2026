# TeestaWatch — Design System & Engineering Contracts (Phase 1)

Platform: Dam-Break & Glacial Lake Outburst Flood (GLOF) Early-Warning System (Sikkim to North Bengal).
Tone: Sober, technical, schematic instrument aesthetic ("Survey Sheet / Gauge Room").
Audience: Authority emergency dispatch operators (Phase 1) & riverine citizens (Phase 2).

---

## 1. Color System

| Token | Hex | Role / Usage |
|---|---|---|
| `gauge-room` | `#11171A` | Dark console background ("Gauge Room") |
| `gauge-panel` | `#1A2226` | Console card and panel container background |
| `rule` | `#2E3B40` | Structural borders, 1px dividers, gridlines |
| `paper` | `#E9E4D3` | Light citizen layer background ("Paper") |
| `paper-panel` | `#DDD6C0` | Light citizen card container background |
| `ink` | `#1E2723` | Text on paper; default dark ink |
| `offwhite` | `#E6E2D3` | High-contrast readable text on dark panels |
| `lichen` | `#6E8B74` | DOMINANT brand/structural/"safe" status indicator |
| `contour` | `#7D8A80` | Secondary text, coordinates, datum ticks, gridlines |
| `watch-amber` | `#E0A526` | Elevated threshold / warning status |
| `danger-vermilion` | `#E2461F` | SINGLE reserved accent: breach alerts & critical danger |

### Flood Depth Color Ramp (No Blue)
- Shallow: `#E7D9A8`
- Mid-Shallow: `#C9A65B`
- Mid-Deep: `#A8702F`
- Deep (Umber): `#6B3213`
- Extent Boundary: Diagonal hatch overlay (`repeating-linear-gradient(45deg, rgba(226,70,31,0.35) ...)`)

### Banned Palettes
Strictly forbidden: Any violet, indigo, purple, teal-to-purple gradients, #6366F1, blue buttons, gray-50 backgrounds, decorative gradient fills.

---

## 2. Typography

- **Display / Numerals**: `Big Shoulders Display` (weights: 700, 800), uppercase, tracking +0.02em. Used for headlines, large instrument readouts, and status titles.
- **Body / UI**: `IBM Plex Sans` (weights: 400, 500).
- **Data / Coordinates / Timestamps**: `IBM Plex Mono` (weights: 400, 500), `tabular-nums`.
- **Scale**: `11px`, `13px`, `15px`, `20px`, `28px`, `44px`, `88px`. Major instrument dials use 88px or 44px Big Shoulders.

---

## 3. Layout & Construction Rules

- **Zero Border-Radius**: `border-radius: 0px` across the entire application (maximum 2px only on map pin indicators).
- **Survey Double Rules**: Two 1px rules separated by a 3px gap (`.double-rule-h`, `.double-rule-v`).
- **Survey Stamps**: Double-bordered uppercase boxes with letterspacing (`.survey-stamp`).
- **SVG Grain Overlay**: Pure inline SVG `feTurbulence` data URI with opacity $\le 0.045$.
- **Asymmetric 12-Col Console Grid**:
  - 48px fixed vertical rail with rotated vertical text labels (`writing-mode: vertical-rl`).
  - Map occupies 8 columns.
  - Data telemetry column occupies 4 columns.
  - Bottom scrubbable recorder paper strip-chart timeline (T+0 to T+120 min).
  - Grid break: Breach Likelihood dial physically overlaps the 8-col map / 4-col data column boundary.
- **Basemap Filter**: Leaflet OpenStreetMap tiles filtered via CSS (`grayscale(100%) invert(92%) sepia(25%) hue-rotate(140deg) saturate(30%) brightness(55%) contrast(140%)`).

---

## 4. Built Components & File Index

| Component | Path | Description |
|---|---|---|
| `Contracts` | `frontend/src/types/contracts.ts` | Mirrors `/ml/schemas.py` contracts (units in field names) |
| `Corridor Model` | `frontend/src/data/corridor.ts` | Teesta corridor centerline nodes & procedural polygon generator |
| `Mock Data` | `frontend/src/data/mock.ts` | 3 real LHS scenarios, frames, 6 stations, precursor signals |
| `API Service` | `frontend/src/services/api.ts` | Async FastAPI-ready service layer with endpoint documentation |
| `DecryptedText` | `frontend/src/components/reactbits/DecryptedText.tsx` | Technical status decrypting text on initial render |
| `CountUp` | `frontend/src/components/reactbits/CountUp.tsx` | Smooth numeric readout animator respecting reduced motion |
| `DotGrid` | `frontend/src/components/reactbits/DotGrid.tsx` | Topographic sheet dot grid in `#2E3B40` & `#7D8A80` |
| `Tabs` | `frontend/src/components/lightswind/Tabs.tsx` | Lightswind technical tab switcher |
| `Toast` | `frontend/src/components/lightswind/Toast.tsx` | Toast notification provider for flood wave threshold crossings |
| `Skeleton` | `frontend/src/components/lightswind/Skeleton.tsx` | Technical loading placeholder |
| `Command` | `frontend/src/components/lightswind/Command.tsx` | Cmd/Ctrl+K survey dispatch command palette |
| `Sheet` | `frontend/src/components/lightswind/Sheet.tsx` | Slide-out telemetry drawer for station inspections |
| `BreachLikelihoodDial` | `frontend/src/components/bespoke/BreachLikelihoodDial.tsx` | Semicircular dial with needle & Big Shoulders 88 readout |
| `GaugeLedger` | `frontend/src/components/bespoke/GaugeLedger.tsx` | Tabular gauge monitor with arrival times & SVG sparklines |
| `StripChartScrubber` | `frontend/src/components/bespoke/StripChartScrubber.tsx` | Recorder-paper scrubber with pen cursor, play/pause, arrow keys |
| `HydrographChart` | `frontend/src/components/bespoke/HydrographChart.tsx` | Hand-written SVG discharge hydrograph with time cursor |
| `ScenarioSpecTable` | `frontend/src/components/bespoke/ScenarioSpecTable.tsx` | Mono contract table showing LHS parameters |
| `PrecursorFeed` | `frontend/src/components/bespoke/PrecursorFeed.tsx` | Precursor anomaly signals (lake level, seismic, rainfall, etc.) |
| `SurveyMap` | `frontend/src/components/map/SurveyMap.tsx` | Leaflet map with survey-filtered basemap & hatch inundation |
| `EntryPage` | `frontend/src/pages/EntryPage.tsx` | Title block, live ticker, DotGrid, asymmetric entry blocks |
| `ConsolePage` | `frontend/src/pages/ConsolePage.tsx` | Complete 12-col Command Console with boundary overlap |
| `CitizenStubPage` | `frontend/src/pages/CitizenStubPage.tsx` | Phase 2 Light "Paper" stub page |

---

## 5. Mock Data Exports

- `SCENARIOS`: 3 sweep scenarios (`braided_plains` 4.1M m³, `steep` 0.88M m³, `confined` 7.87M m³).
- `SCENARIO_BREACH_LIKELIHOOD`: 74%, 42%, 91% composite risk estimates.
- `MOCK_FRAMES`: Procedural inundation GeoJSON frames at T+0, 15, 30, 45, 60, 90, 120 minutes.
- `MOCK_HYDROGRAPHS`: Synthetic hydrograph series with Froehlich-scaled peak discharge.
- `GAUGE_STATIONS`: 6 corridor hydrology stations (Chungthang, Dikchu, Singtam, Rangpo, Teesta Bazar, Sevoke).
- `PRECURSOR_SIGNALS`: 5 telemetry feeds with z-scores, confidence, and timestamps.
- `DEMO_TAG`: `"DEMO DATA · SYNTHETIC PLACEHOLDER"`.

---

## 6. Fast Mode Decisions / Assumptions

- **Map Rendering**: Direct Leaflet inside a React container was selected over raw context wrappers to ensure flawless CSS survey filtering, square-tick HTML markers, and zero context re-render flicker.
- **Corridor Offsets**: Procedural normal-vector offsets along the 10 surveyed Teesta nodes were computed analytically to generate realistic downstream wave expansion without requiring runtime GIS dependencies.
- **Playback Step**: Playback advances through 15-minute simulated intervals (T+0 to T+120 min), triggering dynamic toast alerts as downstream gauge station arrival thresholds are breached.
