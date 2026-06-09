# Retail Intelligence Frontend

React + TypeScript + Material UI frontend for the Retail Intelligence Platform.

## Run Locally

The dashboard expects the Phase 2 API and Postgres seed flow to be running.

```powershell
docker compose up -d postgres
docker compose --profile seed run --rm seed
docker compose up -d --build api frontend
```

Open `http://localhost:5173`.

## Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:3000` | Node API base URL |

## Notes

- Recharts powers the revenue and channel charts.
- Analyst Workspace supports month, region, channel, and category filters against compatible mart endpoints.
- The legacy static dashboard remains available under the original `dashboard/` folder.

## Analyst Workspace

Open the `Analyst` tab after starting the stack. Filters are populated from the Postgres-backed API responses:

- Month options come from `/api/dashboard/revenue`
- Category options come from `/api/dashboard/categories`
- Region options come from `/api/dashboard/regions`
- Channel options come from `/api/dashboard/channels`

The workspace keeps filter state in React and refreshes compatible API requests when filters change.
