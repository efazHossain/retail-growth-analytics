param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("setup", "start", "seed", "smoke", "build", "status", "stop", "config", "legacy-build")]
  [string]$Command
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot

function Invoke-Compose {
  param([string[]]$Arguments)
  Push-Location $projectRoot
  try {
    & docker compose @Arguments
    if ($LASTEXITCODE -ne 0) {
      throw "docker compose $($Arguments -join ' ') failed with exit code $LASTEXITCODE."
    }
  } finally {
    Pop-Location
  }
}

function Invoke-NodeScript {
  param([string[]]$Arguments)
  Push-Location $projectRoot
  try {
    & npm @Arguments
    if ($LASTEXITCODE -ne 0) {
      throw "npm $($Arguments -join ' ') failed with exit code $LASTEXITCODE."
    }
  } finally {
    Pop-Location
  }
}

function Invoke-SmokeWithRetry {
  $smokeScript = Join-Path $PSScriptRoot "smoke-health.ps1"
  for ($attempt = 1; $attempt -le 10; $attempt++) {
    try {
      & $smokeScript
      return
    } catch {
      if ($attempt -eq 10) { throw }
      Write-Host "Waiting for services to become healthy ($attempt/10)..."
      Start-Sleep -Seconds 3
    }
  }
}

switch ($Command) {
  "setup" {
    Invoke-Compose @("up", "-d", "--build", "postgres", "analytics", "api", "frontend")
    Invoke-Compose @("--profile", "seed", "run", "--rm", "seed")
    Invoke-SmokeWithRetry
  }
  "start" { Invoke-Compose @("up", "-d", "--build", "postgres", "analytics", "api", "frontend") }
  "seed" { Invoke-Compose @("--profile", "seed", "run", "--rm", "seed") }
  "smoke" { & (Join-Path $PSScriptRoot "smoke-health.ps1") }
  "build" {
    Invoke-NodeScript @("run", "build")
    Invoke-Compose @("run", "--rm", "--no-deps", "api", "npm", "run", "build")
    Invoke-Compose @("run", "--rm", "--no-deps", "frontend", "npm", "run", "build")
    Invoke-Compose @("run", "--rm", "--no-deps", "analytics", "python", "-c", "from app.main import app; print(app.title)")
  }
  "status" { Invoke-Compose @("ps") }
  "stop" { Invoke-Compose @("down") }
  "config" { Invoke-Compose @("config") }
  "legacy-build" { Invoke-NodeScript @("run", "build") }
}
