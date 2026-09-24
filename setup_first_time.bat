@echo off
setlocal
echo ===================================================
echo   TradoEasy - One-Time First-Time Setup
echo ===================================================
echo.
echo [1/2] Installing Python Backend dependencies...
cd /d "%~dp0backend"
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

echo.
echo [2/2] Installing Frontend dependencies...
cd /d "%~dp0frontend"
call npm install

echo.
echo ===================================================
echo   [SUCCESS] Setup Completed!
echo   From now on, just double-click 'start_dev.bat'
echo   to launch TradoEasy anytime!
echo ===================================================
pause
