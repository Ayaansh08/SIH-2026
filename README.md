# Hybrid Physics-ML Flood Simulation Platform

This monorepo contains the initial scaffolding for a hybrid flood simulation platform combining a Python backend, a React frontend, and a Python ML package for future surrogate model and Earth observation change-detection work.

## Repository structure

- `backend/` — FastAPI application
- `frontend/` — React + TypeScript + Vite UI with Leaflet map
- `ml/` — Python package scaffold for surrogate and EO workflows
- `data/` — placeholder data directories
- `docs/` — per-subproject documentation

## Local development

### Backend

```bash
cd backend
uv venv --python 3.11
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install fastapi "uvicorn[standard]" python-dotenv
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Then open: http://localhost:8000/health

### Frontend

```bash
cd frontend
pnpm install
pnpm dev --host 0.0.0.0
```

Then open: http://localhost:5173

## Notes

This is a scaffolding phase only. No ML, physics, or GIS logic has been implemented yet.
