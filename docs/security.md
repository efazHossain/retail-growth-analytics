# Security and RBAC

Phase 6 adds demo-grade JWT authentication and role-based access control to the Node API gateway and React frontend. This is intentionally local-first and suitable for portfolio architecture review, not production identity management.

## Demo Users

| Username | Password | Role | Access |
| --- | --- | --- | --- |
| `admin` | `AdminDemo123!` | `admin` | All demo routes |
| `analyst` | `AnalystDemo123!` | `analyst` | Dashboard, Analyst Workspace, detailed analytics |
| `executive` | `ExecutiveDemo123!` | `executive` | Executive Dashboard and summary analytics |

Passwords are stored as salted demo hashes in the API code for the MVP. Production systems should use a managed identity provider and a durable user store.

## API Auth Flow

```powershell
$login = Invoke-RestMethod http://localhost:3000/api/auth/login `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"username":"analyst","password":"AnalystDemo123!"}'

$headers = @{ Authorization = "Bearer $($login.data.accessToken)" }
Invoke-RestMethod http://localhost:3000/api/auth/me -Headers $headers
Invoke-RestMethod http://localhost:3000/api/dashboard/summary -Headers $headers
Invoke-RestMethod http://localhost:3000/api/analytics/trends -Headers $headers
```

## Role Rules

| Surface | Admin | Analyst | Executive |
| --- | --- | --- | --- |
| `/health` | public | public | public |
| `/api/auth/login` | public | public | public |
| Dashboard endpoints | yes | yes | yes |
| Analyst Workspace UI | yes | yes | no |
| Analytics summary and KPIs | yes | yes | yes |
| Detailed analytics endpoints | yes | yes | no |

Detailed analytics endpoints are:

- `/api/analytics/forecast-accuracy`
- `/api/analytics/anomalies`
- `/api/analytics/trends`

## MVP Tradeoffs

- JWTs are stored in `localStorage` for a simple local demo. Production should prefer secure, HTTP-only cookies or a hardened token strategy.
- Logout is client-side token removal. Production should use refresh token rotation, revocation, and session/audit logging where required.
- `JWT_SECRET` is environment-based. Production should source it from a secrets manager.
- Demo users are static. Production should use Cognito, Auth0, Azure AD, Okta, or another SSO provider.
- Login rate limiting, Helmet security headers, CORS configuration, request validation, and consistent `401`/`403` responses are included as practical MVP hardening.
