# API Reference

The Node API is available at `http://localhost:3000` when the Docker Compose stack is running. With the exception of health and status probes, routes require a JWT access token.

## Response Conventions

Successful dashboard, analytics, and insights responses use an envelope:

```json
{
  "status": "ok",
  "data": {},
  "meta": { "count": 1 }
}
```

Validation and access failures use a non-2xx status with a safe message:

```json
{
  "status": "error",
  "message": "Authentication required"
}
```

## Authentication

`POST /api/auth/login` is public and returns a local-demo JWT. `GET /api/auth/me` and `POST /api/auth/logout` require a bearer token.

```powershell
$login = Invoke-RestMethod http://localhost:3000/api/auth/login -Method Post -ContentType "application/json" -Body '{"username":"analyst","password":"AnalystDemo123!"}'
$headers = @{ Authorization = "Bearer $($login.data.accessToken)" }
Invoke-RestMethod http://localhost:3000/api/auth/me -Headers $headers
```

Local demo roles are `admin`, `analyst`, and `executive`. The credentials are documented in the root README; they are strictly for local development.

## Public Operational Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Lightweight API liveness probe. |
| `GET` | `/status` | API dependency status for Postgres and analytics. |
| `GET` | `/api/status` | Alias for `/status`. |
| `GET` | `/api/analytics/health` | Proxies the public analytics-service health check. |

## Dashboard Routes

All dashboard routes require a bearer token. Summary, revenue, category, region, channel, forecast, and anomaly views permit any authenticated role. Cohorts permit `admin`, `analyst`, and `executive`.

| Method | Route | Optional query parameters |
| --- | --- | --- |
| `GET` | `/api/dashboard/summary` | None |
| `GET` | `/api/dashboard/revenue` | `month=YYYY-MM`, `limit` |
| `GET` | `/api/dashboard/categories` | `category`, `limit` |
| `GET` | `/api/dashboard/regions` | `region`, `limit` |
| `GET` | `/api/dashboard/channels` | `channel`, `limit` |
| `GET` | `/api/dashboard/cohorts` | `month=YYYY-MM`, `limit` |
| `GET` | `/api/dashboard/forecast` | `month=YYYY-MM`, `limit` |
| `GET` | `/api/dashboard/anomalies` | `month=YYYY-MM`, `severity=normal|medium|high`, `limit` |

The API validates query parameters before sending parameterized queries to Postgres. For example:

```powershell
Invoke-RestMethod "http://localhost:3000/api/dashboard/categories?category=Electronics&limit=5" -Headers $headers
Invoke-RestMethod "http://localhost:3000/api/dashboard/anomalies?severity=high" -Headers $headers
```

## Analytics Proxy Routes

The Node API proxies calculations from FastAPI. `business-summary` and `kpis` accept any authenticated role. Deep analytics routes require `analyst` or `admin`.

| Method | Route | Access |
| --- | --- | --- |
| `GET` | `/api/analytics/business-summary` | Authenticated |
| `GET` | `/api/analytics/kpis` | Authenticated |
| `GET` | `/api/analytics/forecast-accuracy` | Analyst or admin |
| `GET` | `/api/analytics/anomalies` | Analyst or admin |
| `GET` | `/api/analytics/trends` | Analyst or admin |

## AI Insights Routes

All Insights routes require a bearer token. The default `rule_based` provider uses the established dashboard services and does not need an external API key.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/insights/health` | Reports the active provider. |
| `GET` | `/api/insights/suggestions` | Lists supported question prompts. |
| `POST` | `/api/insights/ask` | Answers one validated business question. |

```powershell
Invoke-RestMethod http://localhost:3000/api/insights/ask -Method Post -Headers $headers -ContentType "application/json" -Body '{"question":"Which category is underperforming?"}'
```

The request body must include a non-empty `question` of 500 characters or fewer. Unsupported prompts return a helpful answer and suggested questions instead of an error.

## Analytics Service Direct Routes

The FastAPI service listens at `http://localhost:8000` for local diagnostics. In normal frontend usage, call the authenticated Node gateway rather than these direct endpoints.

| Method | Route |
| --- | --- |
| `GET` | `/health` |
| `GET` | `/status` |
| `GET` | `/analytics/business-summary` |
| `GET` | `/analytics/kpis` |
| `GET` | `/analytics/forecast-accuracy` |
| `GET` | `/analytics/anomalies` |
| `GET` | `/analytics/trends` |
