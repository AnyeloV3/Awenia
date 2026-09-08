@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\VERIFICAR_REQUISITOS.ps1"
pause
