@echo off
title Campus Market - Stop

echo ============================================
echo   Campus Market - Stop All Services
echo ============================================
echo.

:: ---- Close windows ----
echo [1] Closing server windows...
taskkill /fi "WINDOWTITLE eq Mock-Server" >nul 2>&1
taskkill /fi "WINDOWTITLE eq Vite-Dev" >nul 2>&1

:: ---- Free port 3001 ----
echo [2] Freeing port 3001 (Mock API)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') do (
    echo     Killing PID: %%a
    taskkill /f /pid %%a >nul 2>&1
)

:: ---- Free port 5173 ----
echo [3] Freeing port 5173 (Vite)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo     Killing PID: %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo ============================================
echo   All services stopped.
echo ============================================
echo.
timeout /t 2 >nul
exit /b
