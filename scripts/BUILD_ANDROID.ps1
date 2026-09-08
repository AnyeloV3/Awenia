$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host ""; Write-Host "========================================" -ForegroundColor Magenta
Write-Host "       AWENIA - GENERAR .APK" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Falta Node.js." }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw "Falta npm." }
if (-not (Get-Command rustc -ErrorAction SilentlyContinue)) { throw "Falta Rust/rustup." }
if (-not $env:ANDROID_HOME -and -not $env:ANDROID_SDK_ROOT) { throw "No se detectó ANDROID_HOME/ANDROID_SDK_ROOT. Instala Android Studio + SDK." }

npm install
if ($LASTEXITCODE -ne 0) { throw "npm install falló." }

if (-not (Test-Path ".\src-tauri\gen\android")) {
  Write-Host "Inicializando proyecto Android de Tauri por primera vez..." -ForegroundColor Cyan
  npm run android:init
  if ($LASTEXITCODE -ne 0) { throw "tauri android init falló." }
}

Write-Host "Compilando APK universal..." -ForegroundColor Cyan
npm run android:apk
if ($LASTEXITCODE -ne 0) { throw "La compilación APK falló." }

$Apk = Get-ChildItem -Path ".\src-tauri\gen\android\app\build\outputs\apk\**\*.apk" -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Name -notmatch 'unsigned' } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $Apk) { $Apk = Get-ChildItem -Path ".\src-tauri\gen\android\app\build\outputs\apk\**\*.apk" -Recurse -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1 }
if (-not $Apk) { throw "No se encontró el APK generado." }

$Dist = Join-Path $Root "dist-installers"
New-Item -ItemType Directory -Force -Path $Dist | Out-Null
$Dest = Join-Path $Dist "Awenia.apk"
Copy-Item $Apk.FullName $Dest -Force

Write-Host ""; Write-Host "LISTO 🌸" -ForegroundColor Green
Write-Host "APK:" -ForegroundColor White
Write-Host $Dest -ForegroundColor Yellow
Write-Host ""
