@echo off
title Campus Market - Dev

echo ============================================
echo   Campus Market - Start All Services
echo ============================================
echo.

:: ---- Kill existing processes on ports ----
call :killport 3001
call :killport 5173

:: ---- Start Mock API (port 3001) ----
echo [1/2] Starting Mock API Server (port 3001)...
start "Mock-Server" /min cmd /c "cd /d %~dp0 && node mock-server.js"
timeout /t 2 /nobreak >nul

:: ---- Start Vite Dev Server (port 5173) ----
echo [2/2] Starting Vite Dev Server (port 5173)...
start "Vite-Dev" /min cmd /c "cd /d %~dp0 && npx vite --host"
timeout /t 3 /nobreak >nul

echo.
echo ============================================
echo   All services started!
echo.
echo   Frontend : http://localhost:5173
echo   API      : http://localhost:3001
echo.
echo   Run stop.bat to shut down
echo ============================================
echo.
pause
exit /b

:killport
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%1" ^| findstr "LISTENING"') do (
    echo   Freeing port %1 (PID: %%a)
    taskkill /f /pid %%a >nul 2>&1
)
exit /b
