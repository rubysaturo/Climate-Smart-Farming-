@echo off
echo ===================================================
echo   AgriSmart Advisory - System Setup Script
echo ===================================================
echo.

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Python was not found in your system PATH.
    echo Please download and install Python 3.10+ from https://www.python.org/
    echo Make sure to check "Add Python to PATH" during installation.
    echo.
) else (
    echo [OK] Python detected.
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Node.js / npm was not found in your system PATH.
    echo Please download and install Node.js from https://nodejs.org/
    echo.
) else (
    echo [OK] Node.js/npm detected.
)

echo.
echo Installing Django Backend dependencies...
cd climate_smart_backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Django requirements. Please ensure python is installed and try again.
    pause
    exit /b
)
echo Running database migrations...
python manage.py migrate
echo Seeding database fixtures...
python manage.py loaddata farm_data/fixtures/initial_data.json
cd ..

echo.
echo Installing React Frontend dependencies...
cd climate_smart_react
npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to run 'npm install'. Please ensure Node.js is installed and try again.
    pause
    exit /b
)
cd ..

echo.
echo ===================================================
echo   Setup Completed successfully!
echo   Run 'run.bat' to start the application servers.
echo ===================================================
pause
