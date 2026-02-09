@echo off
echo ========================================
echo BIFA Platform - Quick Start
echo ========================================
echo.

echo Starting Backend Server...
start cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Language Toggle: Look for the globe icon in the top-right corner
echo.
echo Test Credentials:
echo   Admin:    admin@bifa.com / admin123
echo   Referee:  referee@bifa.com / referee123
echo   Manager:  manager@bifa.com / manager123
echo.
echo Press any key to exit this window...
pause > nul
