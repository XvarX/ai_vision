@echo off
echo ========================================
echo Restarting Backend and Frontend...
echo ========================================

echo.
echo [1/4] Killing existing processes...
taskkill /F /IM python.exe 2>nul
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/4] Starting Backend...
cd /d "%~dp0backend"
start "Backend Server" cmd /k "python -m uvicorn app.main:app --reload"

echo.
echo [3/4] Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo [4/4] Starting Frontend...
cd /d "%~dp0frontend"
start "Frontend Server" cmd /k "node node_modules/next/dist/bin/next dev"

echo.
echo ========================================
echo Both servers are restarting!
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:3000
echo ========================================
