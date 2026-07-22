@echo off
echo ===================================================
echo   AgriSmart Advisory - Server Launch Script
echo ===================================================
echo.

echo Starting Django Backend REST API on http://127.0.0.1:8000 ...
start "AgriSmart Django Backend" cmd /c "cd climate_smart_backend && python manage.py runserver"

echo Starting React Vite Dev Server on http://localhost:5173 ...
cd climate_smart_react
npm run dev

cd ..
