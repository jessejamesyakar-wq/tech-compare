# ACELEETME Control Hub V0.5 — Windows Runner Shutdown Script
$ErrorActionPreference = "Stop"

$ControlHubDir = "C:\Projects\aceleetme\tools\control-hub"
Set-Location -Path $ControlHubDir

Write-Host "=================================================="
Write-Host "ACELEETME Control Hub V0.5 — Stopping Windows Runner"
Write-Host "=================================================="

# Engage kill switch
npm run pause

Write-Host "Kill switch engaged. Queue runner is PAUSED."
