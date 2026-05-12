@echo off
TITLE AI Behavioral Personality Profiler - Launcher

:: Set project root using the directory of this script
set "PROJECT_ROOT=%~dp0"

echo ======================================================
echo    AI Behavioral Personality Profiler - Dev Launcher
echo ======================================================
echo.

:: Start Backend
echo [1/2] Starting .NET Backend...
:: Using /D to set the directory avoids issues with ampersands in paths during 'cd'
start "Backend - AIProfilerAPI" /D "%PROJECT_ROOT%backend\AIProfilerAPI" cmd /k "dotnet watch run"

:: Start Frontend
echo [2/2] Starting Angular Frontend...
:: Bypassing 'npm start' to avoid path-mangling bugs with '&' in .cmd wrappers
:: We call node directly on the Angular CLI entry point.
start "Frontend - Angular" /D "%PROJECT_ROOT%frontend" cmd /k "node .\node_modules\@angular\cli\bin\ng.js serve"

echo.
echo ======================================================
echo  Services are starting in separate terminal windows.
echo  - Backend: http://localhost:5233 (Swagger/API)
echo  - Frontend: http://localhost:4200
echo ======================================================
echo.
pause
