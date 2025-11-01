Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Testing Cashier-App Frontend on Port 3000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking if port 3000 is available..." -ForegroundColor Yellow
$portCheck = netstat -an | Select-String ":3000"
if ($portCheck) {
    Write-Host "WARNING: Port 3000 is already in use!" -ForegroundColor Red
    Write-Host "This might cause the app to use a different port." -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to continue anyway..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

Write-Host ""
Write-Host "Starting Cashier-App Frontend on port 3000..." -ForegroundColor Green
Write-Host "Using: npm run frontend (which forces port 3000)" -ForegroundColor Green
Set-Location "cashier-app"
npm run frontend

Write-Host ""
Write-Host "Cashier-App Frontend should now be running on:" -ForegroundColor Yellow
Write-Host "http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "If it's on a different port, check the terminal output above." -ForegroundColor Gray
