$ErrorActionPreference = "Stop"

$projectPath = "C:\Users\efazh\Projects\analytics-project"
$wslPath = "/mnt/c/Users/efazh/Projects/analytics-project"

Write-Host "Running Python analysis layer through WSL..."
wsl.exe -e bash -lc "cd '$wslPath' && bash scripts/run-python.sh"

Write-Host "Python outputs should be available in: $projectPath\python\outputs"
