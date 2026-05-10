import { spawnSync } from "node:child_process";

const steps = [
  ["generate raw data", "scripts/generate-data.js"],
  ["build staging models", "scripts/build-staging.js"],
  ["build marts", "scripts/build-marts.js"],
  ["validate data quality", "scripts/validate-data.js"],
  ["run SQL-style analysis", "scripts/run-sql-analysis.js"],
  ["write dashboard summary", "scripts/analyze.js"],
  ["record run history", "scripts/record-run-history.js"]
];

for (const [label, script] of steps) {
  console.log(`\n> ${label}`);
  const result = spawnSync(process.execPath, [script], { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("\nBuild complete.");
