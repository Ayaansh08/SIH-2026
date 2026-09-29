# Backend

This service exposes a minimal FastAPI app for the initial monorepo scaffold.

## Run locally

```bash
cd backend
uv venv --python 3.11
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install fastapi "uvicorn[standard]" python-dotenv
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health endpoint:

```bash
curl http://localhost:8000/health
```
