@echo off
echo ========================================
echo Prasad K. Gamage Learning Assistant
echo Checking Available Gemini Models...
echo ========================================
echo.

cd /d "%~dp0..\scripts"
python check_models.py

pause
