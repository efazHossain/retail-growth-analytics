# Dashboard Screenshot Checklist

Use this checklist when you capture dashboard screenshots for project updates.

1. Run the full data build:

```powershell
node scripts/build.js
```

2. Start the dashboard:

```powershell
node dashboard/server.js
```

3. Open `http://localhost:4173` and capture the overview screen.

Recommended filename:

```text
docs/assets/dashboard-overview.png
```

This keeps screenshots as project artifacts without adding machine-specific browser automation to the repo.
