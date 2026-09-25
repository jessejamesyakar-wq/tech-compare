# ACELEETME Control Hub V0.5 — Windows Task Scheduler Removal Script

$TaskName = "ACELEETME-Control-Hub"

Write-Host "=================================================="
Write-Host "ACELEETME Control Hub V0.5 — Task Scheduler Removal"
Write-Host "=================================================="
Write-Host "Task Name: $TaskName"
Write-Host "--------------------------------------------------"

$SchtasksCmd = "schtasks /Delete /TN `"$TaskName`" /F"
Write-Host "Generated removal command:"
Write-Host $SchtasksCmd
Write-Host "--------------------------------------------------"
