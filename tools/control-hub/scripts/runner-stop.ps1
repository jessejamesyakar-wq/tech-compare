# ACELEETME Control Hub V0.5 — Windows Runner Shutdown Script
$ErrorActionPreference = "Stop"

$ControlHubDir = Split-Path -Parent $PSScriptRoot
Set-Location -Path $ControlHubDir

Write-Host "=================================================="
Write-Host "ACELEETME Control Hub V0.5 — Stopping Windows Runner"
Write-Host "=================================================="

# Engage kill switch
npm run pause

Write-Host "Kill switch engaged. Queue runner is PAUSED."
