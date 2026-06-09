# Postgres Seed Plan

Phase 2 adds a repeatable seed loader for local development.

Run it after Postgres is started:

```powershell
docker compose --profile seed run --rm seed
```

The loader imports the existing CSV marts from `data/marts/` into the `retail` schema:

- `mart_monthly_revenue`
- `mart_category_performance`
- `mart_regional_margin`
- `mart_channel_performance`
- `mart_cohort_retention`
- `mart_forecast_accuracy`
- `mart_forecast_backtest`
- `mart_anomaly_alerts`

The existing CSV pipeline remains the source of truth. Re-run `node scripts/build.js` first if you need to regenerate marts, then run the seed command again.
