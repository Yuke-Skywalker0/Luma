@echo off
setlocal
cd /d "%~dp0"
echo Luma Music V7.2 - Native setup
where node >nul 2>nul || (echo Node.js non trovato. Installa Node.js 24.x e riprova.& pause & exit /b 1)
call npm run install:all || (echo Errore installazione dipendenze backend/frontend.& pause & exit /b 1)
call npm install || (echo Errore installazione Capacitor CLI.& pause & exit /b 1)
if not exist frontend\.env.production copy frontend\.env.native.example frontend\.env.production
echo.
echo Ora modifica frontend\.env.production e imposta VITE_API_BASE_URL con il dominio Render.
echo Poi esegui: npm run build:frontend
 echo Poi: npm run native:add:android
 echo Poi: npm run native:sync
 echo Poi: npm run native:open:android
pause
