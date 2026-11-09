@echo off
setlocal
echo ===================================================
echo Starting TradoEasy Real-Time Market Intelligence Terminal
echo ===================================================

set "PATH=%LOCALAPPDATA%\Programs\Python\Python312;%LOCALAPPDATA%\Programs\Python\Python312\Scripts;%LOCALAPPDATA%\Programs\Python\Python311;%LOCALAPPDATA%\Programs\Python\Python311\Scripts;%ProgramFiles%\nodejs;%PATH%"

start "TradoEasy Backend (FastAPI)" cmd /k "cd /d "%~dp0backend" && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

start "TradoEasy Frontend (Vite)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ===================================================
echo [OK] TradoEasy Terminal started!
echo.
echo  - Open your browser at:  http://localhost:5173
echo  - Backend API running at: http://localhost:8000
echo ===================================================
pause
