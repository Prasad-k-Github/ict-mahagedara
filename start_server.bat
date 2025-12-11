@echo off
echo ========================================
echo Prasad K. Gamage Learning Assistant
echo Starting API Server...
echo ========================================
echo.

cd /d "%~dp0backend"
python api_server.py

pause
