# Analytics Service

Phase 5 adds a lightweight FastAPI analytics service over the existing retail mart CSVs. The service is intentionally CSV-first for the MVP because the Python analytics layer already works with `data/marts`, and a read-only mart mount keeps the service independent from the Postgres serving layer used by the Node API.

## Endpoints

- `GET /health`
- `GET /analytics/forecast-accuracy`
- `GET /analytics/anomalies`
- `GET /analytics/business-summary`
- `GET /analytics/kpis`
- `GET /analytics/trends`

The Node API gateway proxies the same analytics endpoints under `/api/analytics/*`.

## Local Data Source

Docker Compose mounts:

```text
./data/marts:/marts:ro
```

The service reads `MARTS_DIR`, defaulting to the repository `data/marts` folder when run outside Docker.

## Verification

```powershell
docker compose up -d --build analytics api
Invoke-RestMethod http://localhost:8000/health
Invoke-RestMethod http://localhost:8000/analytics/business-summary
Invoke-RestMethod http://localhost:3000/api/analytics/health
Invoke-RestMethod http://localhost:3000/api/analytics/kpis
Invoke-RestMethod http://localhost:3000/api/analytics/trends
```

## Future Work

- Move the analytics service from CSV reads to Postgres queries if shared transactional consistency becomes important.
- Add request parameters for analyst-focused filtering.
- Add persisted insight history after authentication and AI assistant phases are in place.
