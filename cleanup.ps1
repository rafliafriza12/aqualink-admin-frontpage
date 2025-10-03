# Stop all Node.js processes
Write-Host "Stopping Node.js processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Remove .next directory
Write-Host "Removing .next directory..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

# Remove node_modules/.cache if exists
Write-Host "Cleaning node_modules cache..." -ForegroundColor Yellow
if (Test-Path "node_modules\.cache") {
    Remove-Item -Path "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "Cleanup complete!" -ForegroundColor Green
Write-Host "You can now run: npm run dev" -ForegroundColor Cyan
