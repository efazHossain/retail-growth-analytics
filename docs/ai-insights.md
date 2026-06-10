# AI Insights

Phase 7 adds a secure AI-style insights layer for asking business questions about the retail analytics marts. The MVP uses a deterministic rule-based provider, so it works locally without a paid external LLM or API key.

## Provider Architecture

The Node API exposes an insight provider interface with two implementations:

- `RuleBasedInsightProvider`: default MVP provider using Postgres-backed dashboard service data.
- `ExternalLlmInsightProvider`: placeholder for a future external LLM integration.

Provider selection is environment-driven:

```text
INSIGHT_PROVIDER=rule_based
```

The future `external_llm` option should use environment-managed secrets and should not hardcode provider credentials.

## Endpoints

- `GET /api/insights/health`
- `GET /api/insights/suggestions`
- `POST /api/insights/ask`

All insights endpoints require JWT authentication.

Example:

```powershell
$login = Invoke-RestMethod http://localhost:3000/api/auth/login -Method Post -ContentType "application/json" -Body '{"username":"analyst","password":"AnalystDemo123!"}'
$headers = @{ Authorization = "Bearer $($login.data.accessToken)" }

Invoke-RestMethod http://localhost:3000/api/insights/ask `
  -Method Post `
  -Headers $headers `
  -ContentType "application/json" `
  -Body '{"question":"Which category is underperforming?"}'
```

## Supported MVP Questions

- "Summarize this month's performance."
- "Which category is underperforming?"
- "Which region has the weakest margin?"
- "Why did forecast accuracy drop?"
- "What anomalies should I care about?"
- "Which channel is performing best?"
- "What actions should the business take?"

Unsupported prompts return a helpful fallback with suggested questions.

## Evidence Model

Insight responses include structured evidence:

- `metric`
- `value`
- `comparison`
- `source`
- `period`
- `dimension`

This keeps the MVP explainable and portfolio-friendly while leaving room for a future LLM to synthesize richer narratives.

## Security

- Insights endpoints are not public.
- Auth uses the Phase 6 JWT middleware.
- Request body validation requires a non-empty `question` no longer than 500 characters.
- The rule-based provider reuses existing Postgres-backed dashboard services instead of accepting raw SQL or arbitrary data access.

## Limitations

- No external LLM is called in Phase 7.
- Answers are deterministic and pattern-matched to supported question families.
- Insights are generated live and are not persisted.
- Executive users can access summary-style MVP insights; deeper role-specific insight splitting can be expanded later.
