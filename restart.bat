@echo off
echo ========================================
echo Restarting Backend and Frontend...
echo ========================================

echo.
echo [1/4] Stopping existing servers...

echo Killing processes on port 8000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000.*LISTENING"') do (
    taskkill /F /PID %%a 2>nul
)

echo Killing processes on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000.*LISTENING"') do (
    taskkill /F /PID %%a 2>nul
)

timeout /t 2 /nobreak >nul

echo.
echo [2/4] Starting Backend...
cd /d "%~dp0backend"
start "Backend Server" cmd /k "venv\Scripts\python.exe -m uvicorn app.main:app --reload"

echo.
echo [3/4] Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo [4/4] Starting Frontend...
cd /d "%~dp0frontend"
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo Both servers are starting!
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:3000
echo ========================================
echo.
pause
