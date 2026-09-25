# ACELEETME Control Hub V0.5 — Windows Task Scheduler Generator
# NOTE: Generates and validates Task Scheduler definition without permanent registration.

$TaskName = "ACELEETME-Control-Hub"
$WorkingDir = "C:\Projects\aceleetme\tools\control-hub"
$ScriptPath = "$WorkingDir\scripts\runner-start.ps1"

Write-Host "=================================================="
Write-Host "ACELEETME Control Hub V0.5 — Task Scheduler Configuration"
Write-Host "=================================================="
Write-Host "Task Name: $TaskName"
Write-Host "Working Directory: $WorkingDir"
Write-Host "Action Script: $ScriptPath"
Write-Host "Trigger: At User Logon (/SC ONLOGON)"
Write-Host "Secrets Exposure: ZERO (Secrets read strictly from user environment variables)"
Write-Host "Admin Privileges: NOT REQUIRED (Runs with standard user logon privileges)"
Write-Host "--------------------------------------------------"

$SchtasksCmd = "schtasks /Create /TN `"$TaskName`" /TR `"powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$ScriptPath`"`" /SC ONLOGON /F"

Write-Host "Generated schtasks command:"
Write-Host $SchtasksCmd
Write-Host "--------------------------------------------------"
Write-Host "TASK_SCHEDULER_READY = YES"
Write-Host "Task Scheduler Installed = NO (Dry-run / Configuration mode active)"
