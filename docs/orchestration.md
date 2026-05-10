# Orchestration

The project uses a lightweight local build runner instead of a full scheduler.

Run:

```powershell
node scripts/build.js
```

The build executes:

1. Generate raw source data
2. Build staging models
3. Build marts
4. Validate data quality
5. Materialize SQL-style analysis outputs
6. Write dashboard summaries
7. Record run history

## Run History

Each build records a pipeline run in:

```text
data/run_history/pipeline_runs.csv
data/run_history/latest_run.json
```

Tracked fields include:

- run ID
- build status
- raw row counts
- staging row counts
- fact row count
- curated model count
- validation check count
- validation failure count
- anomaly alert count

This gives the project a simple operational layer: the pipeline does not only create outputs, it records whether each run produced trusted data.
