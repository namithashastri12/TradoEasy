@echo off
setlocal
echo ===================================================
echo Starting TradoEasy Real-Time Market Intelligence Terminal
echo ===================================================

set "PATH=C:\Program Files\nodejs;C:\Users\HP\AppData\Local\Programs\Python\Python311;C:\Users\HP\AppData\Local\Programs\Python\Python311\Scripts;%PATH%"

start "TradoEasy Backend (FastAPI)" cmd /k "cd /d "%~dp0backend" && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 2 /nobreak >nul

start "TradoEasy Frontend (Vite)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 2 /nobreak >nul

start "TradoEasy Live Cloud Tunnel (For Your Brother)" cmd /k "ngrok http 8000"

echo.
echo ===================================================
echo [OK] Local Terminal (Your PC): http://localhost:5173
echo [OK] Local Backend:            http://127.0.0.1:8000
echo.
echo [OK] For your Brother anywhere in the world:
echo      1. Open:   https://trado-easy.vercel.app
echo      2. Click:  Connect FYERS - Backend API URL tab
echo      3. Paste:  https://unstopped-anthem-bullfrog.ngrok-free.dev
echo ===================================================
pause
