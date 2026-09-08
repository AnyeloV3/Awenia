@echo off
setlocal
cd /d "%~dp0"
title Awenia App

echo.
echo ==========================================
echo       AWENIA - ADMINISTRACION LOCAL
echo ==========================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js no esta instalado.
  echo Instala Node.js LTS y vuelve a ejecutar este archivo.
  pause
  exit /b 1
)

where pnpm >nul 2>nul
if not errorlevel 1 goto use_pnpm

echo pnpm no esta disponible. Se utilizara npm.
if not exist node_modules (
  echo Instalando dependencias...
  call npm install
  if errorlevel 1 goto install_error
)
start "" cmd /c "timeout /t 4 /nobreak >nul & start http://localhost:3000/awenia"
call npm run dev
goto end

:use_pnpm
if not exist node_modules (
  echo Instalando dependencias...
  call pnpm install
  if errorlevel 1 goto install_error
)
start "" cmd /c "timeout /t 4 /nobreak >nul & start http://localhost:3000/awenia"
call pnpm dev
goto end

:install_error
echo.
echo No se pudieron instalar las dependencias. Verifica tu conexion a Internet.
pause
exit /b 1

:end
endlocal
