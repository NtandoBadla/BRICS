@echo off
echo Seeding competitions and matches...
cd backend
node seed-competitions.js
echo.
echo Done! You can now test the application.
pause
