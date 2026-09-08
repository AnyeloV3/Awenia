$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host ""; Write-Host "========================================" -ForegroundColor Magenta
Write-Host "       AWENIA - GENERAR .EXE" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Falta Node.js." }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw "Falta npm." }
if (-not (Get-Command rustc -ErrorAction SilentlyContinue)) { throw "Falta Rust. Instala rustup antes de compilar." }
if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) { throw "Falta Cargo/Rust." }

Write-Host "[1/4] Instalando/verificando dependencias..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) { throw "npm install falló." }

Write-Host "[2/4] Validando exportación web local..." -ForegroundColor Cyan
npm run web:build
if ($LASTEXITCODE -ne 0) { throw "La compilación web falló." }

Write-Host "[3/4] Generando instalador NSIS de Awenia..." -ForegroundColor Cyan
npm run desktop:build
if ($LASTEXITCODE -ne 0) { throw "La compilación de Tauri falló." }

Write-Host "[4/4] Buscando instalador..." -ForegroundColor Cyan
$Installer = Get-ChildItem -Path ".\src-tauri\target\release\bundle\nsis\*.exe" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $Installer) { throw "No se encontró el .exe generado." }

$Dist = Join-Path $Root "dist-installers"
New-Item -ItemType Directory -Force -Path $Dist | Out-Null
$Dest = Join-Path $Dist "Awenia-Setup.exe"
Copy-Item $Installer.FullName $Dest -Force

Write-Host ""; Write-Host "LISTO 🌸" -ForegroundColor Green
Write-Host "Instalador:" -ForegroundColor White
Write-Host $Dest -ForegroundColor Yellow
Write-Host ""
