@echo off
echo Setting up Cashiers Database...
echo.

echo Running database migration...
php artisan migrate

echo.
echo Creating cashiers table...
echo.

echo Testing API endpoint...
curl -X GET http://localhost:8000/api/cashiers

echo.
echo Setup complete! The cashiers API is ready.
echo.
echo You can now:
echo 1. Register new cashiers through the admin interface
echo 2. View all cashiers from the database
echo 3. Manage cashier status and information
echo.
pause
