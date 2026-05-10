@echo off
echo Starting MindCare AI complete project without nodemon or Vite dev server...
echo.

cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File scripts\start-complete.ps1
pause
