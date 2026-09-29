# Pravah-X — Design System & Engineering Contracts

Platform: Dam-break & glacial-lake outburst flood (GLOF) digital twin. Teesta River Basin, Sikkim to North Bengal.
Tone: Sober, technical, instrument-like. "Survey Sheet / Gauge Room."
Working title: **Pravah-X** (Display: `PRAVAH-X`, Prose: `Pravah-X`, Package: `pravah-x`, Hindi: `प्रवाह-X`).
LocalStorage prefix: `pravahx:`.

---

## 1. Unified Color System (`tokens.css`: Night ↔ Paper)

All colors are controlled via CSS variables in `src/styles/tokens.css` with two synchronized themes:

### Night Palette (`[data-theme="night"]` — default on Home & `/console`)
- `--theme-bg`: `#11171A` (Gauge Room dark background)
- `--theme-panel`: `#1A2226` (Card and panel container)
- `--theme-text`: `#E6E2D3` (High-contrast light cream text)
- `--theme-text-muted`: `#A3AEA5` (Secondary text)
- `--theme-rule`: `#2E3B40` (1px structural dividers & gridlines)
- `--theme-lichen`: `#6E8B74` (Dominant brand / safe status)
- `--theme-amber`: `#E0A526` (Elevated warning status)
- `--theme-vermilion`: `#E2461F` (Reserved danger & breach status only)

### Paper Palette (`[data-theme="paper"]` — default on `/citizen`)
- `--theme-bg`: `#E9E4D3` (Survey sheet paper background)
- `--theme-panel`: `#DDD6C0` (Printed card panel container)
- `--theme-text`: `#1E2723` (High-contrast printed dark ink)
- `--theme-text-muted`: `#4F5E56` (Secondary dark ink)
- `--theme-rule`: `#1E2723` (1px ink neatline borders & rules)
- `--theme-lichen`: `#6E8B74` (Safe status / verified route)
- `--theme-amber`: `#E0A526` (Watch / avoid bridge status)
- `--theme-vermilion`: `#E2461F` (Critical danger / closed bridges)

### Theme Switching (`ThemeToggle`)
- Hard-edged two-segment toggle (`NIGHT` / `PAPER`) in the universal header.
- Persisted under `pravahx:theme`.
- Automatically respects `prefers-color-scheme` if no user preference is cached.

---

## 2. Universal Components & Primitives

| Component | Path | Description |
|---|---|---|
| `Wordmark` | `src/components/Wordmark.tsx` | Big Shoulders display name with "X" in hard-edged survey crosshair square (`sm`, `md`, `lg`, `hero`). |
| `AppHeader` | `src/ui/AppHeader.tsx` | Universal 56px header with `Wordmark`, route stamp (`HOME`, `CONSOLE`, `CITIZEN`), survey metadata strip, and `ThemeToggle`. |
| `DotGrid` | `src/components/reactbits/DotGrid.tsx` | Topographic registration dot/cross grid in `#2E3B40` (Night) or `#1E2723` (Paper). |
| `SurveyStamp` | `src/components/citizen/SurveyStamp.tsx` | Double-border status stamp rotated -2° with hard SVG shape (square, triangle, diamond) and decrypt reveal. |
| `RulerGauge` | `src/components/citizen/RulerGauge.tsx` | Horizontal surveyor ruler 0–100% with 3px needle and mechanical odometer roll. |
| `BridgeNotice` | `src/components/citizen/BridgeNotice.tsx` | Hard-edged diagonal closure tape with live bridge safety telemetry and bypass triggers. |
| `RouteFieldNotes` | `src/components/citizen/RouteFieldNotes.tsx` | Trekker's field log with distance tick SVG ruler and Big Shoulders 44 walking ETA. |
| `CSRLedger` | `src/components/citizen/CSRLedger.tsx` | Schedule VII infrastructure ledger with unclipped multi-line CSR stamp, ruled desktop table, and sponsor modal sheet. |
| `CitizenMap` | `src/components/citizen/CitizenMap.tsx` | Interactive survey map with danger zone buffers, bridge telemetry, asset markers, and route polyline overlay. |

---

## 3. Desktop & Mobile Layout Contracts

### Desktop Layout (`/citizen` on screens $\ge 1024\text{px}$)
- **12-Column Sheet Layout (Max-width 1440px):**
  - **Left 5 Columns:** Active tab content (`STATUS`, `MAP`, `EVACUATE`, `PROTECT`). Horizontal tab switcher at the top with 3px ink top rule on active tab.
  - **Right 7 Columns:** Sticky full-height Leaflet map (`position: sticky; top: 16px; height: calc(100vh - 32px)`) reacting dynamically to the active tab:
    - *STATUS & MAP:* Danger zone flood extents with 150m expansion buffer and time chips.
    - *EVACUATE:* Dijkstra walking polyline (dash 8/6) and blocked segments.
    - *PROTECT:* Highlighted infrastructure assets; card clicks pan directly to asset marker.
- **$\ge 1440\text{px}$ Margins:** Centered sheet with drafting paper registration cross grid continuing across full background.

### Mobile Layout (`/citizen` on screens $< 1024\text{px}$)
- 390px mobile-first centered sheet (max-width ~480px).
- Bottom 4-tab bar (Touch targets $\ge 48\text{px}$, hard corners, 3px active top indicator).

---

## 4. Hierarchy & Visual Polish

1. **CSR Stamp Wrapping:** "CSR-ELIGIBLE (Schedule VII, disaster management)" label given `min-width: 0`, `white-space: normal`, `line-height: 1.3`, multi-line wrapping so it is never truncated.
2. **Asset Card Hierarchy:**
   - Asset name in Big Shoulders 28.
   - Meta line (`[ASSET-ID] · KM x · type`) in 12px mono muted.
   - Verdict badge top-right in Big Shoulders.
   - Recommended measure panel highlighted with 3px ink left rule.
   - Funding figures in mono 15px with percentage in Big Shoulders 32.
3. **Full-Width Home Page:**
   - Full-width live gauge ticker.
   - 12-column grid at 8/4: Command Console (large) vs Pravah-X Citizen (paper palette).
   - Right hero survey inset: Static SVG corridor mini-map with 8 bridge ticks, scale bar, and WATCH marker.
