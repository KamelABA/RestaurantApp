@echo off
echo ========================================
echo    Testing Cashier App on Port 3000
echo ========================================
echo.

echo Checking if port 3000 is available...
netstat -an | findstr :3000
if %errorlevel% equ 0 (
    echo WARNING: Port 3000 is already in use!
    echo This might cause the app to use a different port.
    echo.
    echo Press any key to continue anyway...
    pause > nul
)

echo.
echo Starting Cashier App on port 3000...
echo Using: npm run dev (which forces port 3000)
cd Caissier
npm run dev

echo.
echo Cashier App should now be running on:
echo http://localhost:3000
echo.
echo If it's on a different port, check the terminal output above.
echo.
echo Press any key to stop...
pause > nul
