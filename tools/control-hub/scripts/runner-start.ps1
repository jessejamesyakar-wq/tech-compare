# ACELEETME Control Hub V0.5 — Windows Runner Startup Script
$ErrorActionPreference = "Stop"

$ControlHubDir = "C:\Projects\aceleetme\tools\control-hub"
Set-Location -Path $ControlHubDir

Write-Host "=================================================="
Write-Host "ACELEETME Control Hub V0.5 — Starting Windows Runner"
Write-Host "=================================================="

# Verify secrets come from user environment, never command flags
if (-not $env:OPENAI_API_KEY) {
    Write-Host "[WARNING] OPENAI_API_KEY is not set in environment. OpenAI reviewer will fail-closed (REVIEWER_UNAVAILABLE)."
}

# Resume runner if paused
Write-Host "Disengaging kill switch..."
npm run resume

# Start autonomous continuous runner loop
Write-Host "Launching continuous runner loop daemon..."
npm run runner:start
