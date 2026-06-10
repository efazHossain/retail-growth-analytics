param(
  [string]$ApiBaseUrl = "http://localhost:3000",
  [string]$AnalyticsBaseUrl = "http://localhost:8000",
  [string]$FrontendBaseUrl = "http://localhost:5173"
)

$ErrorActionPreference = "Stop"

function Write-Step {
  param([string]$Message)
  Write-Host "[smoke] $Message"
}

Write-Step "Checking frontend"
$frontend = Invoke-WebRequest $FrontendBaseUrl -UseBasicParsing
if ($frontend.StatusCode -lt 200 -or $frontend.StatusCode -ge 400) {
  throw "Frontend returned HTTP $($frontend.StatusCode)"
}

Write-Step "Checking public API health and status"
Invoke-RestMethod "$ApiBaseUrl/health" | Out-Null
Invoke-RestMethod "$ApiBaseUrl/status" | Out-Null

Write-Step "Checking public analytics health and status"
Invoke-RestMethod "$AnalyticsBaseUrl/health" | Out-Null
Invoke-RestMethod "$AnalyticsBaseUrl/status" | Out-Null

Write-Step "Logging in as analyst"
$login = Invoke-RestMethod "$ApiBaseUrl/api/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"username":"analyst","password":"AnalystDemo123!"}'

$headers = @{ Authorization = "Bearer $($login.data.accessToken)" }

Write-Step "Checking authenticated dashboard endpoint"
Invoke-RestMethod "$ApiBaseUrl/api/dashboard/summary" -Headers $headers | Out-Null

Write-Step "Checking authenticated analytics proxy"
Invoke-RestMethod "$ApiBaseUrl/api/analytics/business-summary" -Headers $headers | Out-Null

Write-Step "Checking AI insights endpoint"
Invoke-RestMethod "$ApiBaseUrl/api/insights/ask" `
  -Method Post `
  -ContentType "application/json" `
  -Headers $headers `
  -Body '{"question":"Which category is underperforming?"}' | Out-Null

Write-Step "Smoke checks passed"
