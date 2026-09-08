# Estado de validación de Awenia 4.0

Validaciones realizadas al preparar este paquete:

- `package.json`: JSON válido.
- `src-tauri/tauri.conf.json`: JSON válido.
- `src-tauri/capabilities/default.json`: JSON válido.
- El código TypeScript/TSX principal fue parseado con TypeScript sin errores de sintaxis; los únicos avisos en este entorno fueron módulos no instalados.
- Se confirmó que la base conserva la sección **Caja** y el responsive de Awenia V3.1.
- Se generaron iconos `.png`, `.ico`, `.icns` y recursos `.bmp` para el instalador NSIS.

## Limitación de este entorno

No se ejecutó el bundle final de Windows ni Android aquí porque este contenedor no tiene Rust/Cargo ni Android SDK instalados. Los scripts incluidos verifican esos requisitos en tu PC antes de compilar.

La primera compilación debe hacerse en tu PC de desarrollo. Una vez producido el `.exe` o `.apk`, Wendy solo necesita instalar ese archivo; no necesita las herramientas de desarrollo.
