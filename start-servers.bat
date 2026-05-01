@echo off
echo Starting MindCare AI Servers...
echo.

:: Kill any existing node processes
taskkill /F /IM node.exe 2>nul
taskkill /F /IM python.exe 2>nul
timeout /t 2 /nobreak >nul

:: Start ML service
echo Starting ML Service on port 5001...
start "ML Service" cmd /k "cd /d c:\Users\DELL\Desktop\mental health\mindcare-ai\ml-service && python app.py"

:: Start Backend
echo Starting Backend Server on port 5000...
start "Backend Server" cmd /k "cd /d c:\Users\DELL\Desktop\mental health\mindcare-ai\server && npm run dev"

:: Wait for services to start
timeout /t 5 /nobreak >nul

:: Start Frontend
echo Starting Frontend Server on port 5173...
start "Frontend Server" cmd /k "cd /d c:\Users\DELL\Desktop\mental health\mindcare-ai\client && npm run dev -- --host 127.0.0.1 --port 5173"

:: Start Load Balancer
echo Starting Load Balancer on port 8080...
start "Load Balancer" cmd /k "cd /d c:\Users\DELL\Desktop\mental health\mindcare-ai\server && npm run load-balancer"

echo.
echo Servers starting...
echo Complete website: http://localhost:8080
echo Frontend direct: http://localhost:5173
echo Backend: http://localhost:5000
echo ML Service: http://localhost:5001
echo Load Balancer Health: http://localhost:8080/lb-health
echo.
pause
