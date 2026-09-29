@echo off
cd /d %~dp0
call npm install --prefix backend
if errorlevel 1 exit /b 1
call npm install --prefix frontend
if errorlevel 1 exit /b 1
call npm run build --prefix frontend
if errorlevel 1 exit /b 1
call npm run build --prefix backend
if errorlevel 1 exit /b 1
echo.
echo Luma Music 6.9.0 build completata.
echo Avvio con: npm start
pause
