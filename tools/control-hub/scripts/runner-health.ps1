# ACELEETME Control Hub V0.5 — Windows Runner Health & Summary Script
$ErrorActionPreference = "Stop"

$ControlHubDir = Split-Path -Parent $PSScriptRoot
Set-Location -Path $ControlHubDir

Write-Host "=================================================="
Write-Host "ACELEETME Control Hub V0.5 — Health & Owner Summary"
Write-Host "=================================================="

npm run runner:health
Write-Host ""
npm run summary
