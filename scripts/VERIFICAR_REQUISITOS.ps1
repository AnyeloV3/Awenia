$ErrorActionPreference = "SilentlyContinue"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Check($Label, $Command) {
  $ok = [bool](Get-Command $Command -ErrorAction SilentlyContinue)
  if ($ok) { Write-Host "[OK] $Label" -ForegroundColor Green }
  else { Write-Host "[FALTA] $Label" -ForegroundColor Red }
  return $ok
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host " AWENIA - VERIFICAR COMPILACION" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

$node = Check "Node.js" "node"
$npm = Check "npm" "npm"
$rust = Check "Rust" "rustc"
$cargo = Check "Cargo" "cargo"
$java = Check "Java" "java"

if ($env:ANDROID_HOME -or $env:ANDROID_SDK_ROOT) {
  Write-Host "[OK] Android SDK" -ForegroundColor Green
} else {
  Write-Host "[FALTA] Android SDK / ANDROID_HOME" -ForegroundColor Yellow
}

Write-Host ""
if ($node -and $npm -and $rust -and $cargo) {
  Write-Host "Windows: base preparada para compilar Awenia." -ForegroundColor Green
} else {
  Write-Host "Windows: instala los elementos marcados como FALTA." -ForegroundColor Yellow
}

if ($node -and $npm -and $rust -and $cargo -and $java -and ($env:ANDROID_HOME -or $env:ANDROID_SDK_ROOT)) {
  Write-Host "Android: base preparada para inicializar/compilar." -ForegroundColor Green
} else {
  Write-Host "Android: todavía faltan requisitos." -ForegroundColor Yellow
}
Write-Host ""
