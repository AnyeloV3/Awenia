# Awenia 4.0 — instaladores Windows + Android

Esta versión incorpora **Tauri 2** para convertir Awenia en una aplicación instalable real, manteniendo la interfaz y los datos locales de la V3.1.

## Resultado esperado

Después de preparar una PC de desarrollo una sola vez:

- `GENERAR_EXE.bat` crea `dist-installers/Awenia-Setup.exe`
- `GENERAR_APK.bat` crea `dist-installers/Awenia.apk`

La computadora o tablet donde Wendy instale Awenia **no necesita Node.js, VS Code ni ejecutar localhost**.

## Windows — requisitos de la PC que compila

1. Windows 10/11 de 64 bits.
2. Node.js LTS + npm.
3. Rust mediante rustup.
4. Microsoft C++ Build Tools / Visual Studio Build Tools con "Desktop development with C++".
5. WebView2. El instalador está configurado para descargar el bootstrapper si hace falta.

Después basta con ejecutar `GENERAR_EXE.bat`.

El instalador NSIS está configurado para instalar por usuario, por lo que normalmente no requiere privilegios de administrador. Incluye recursos visuales de Awenia para cabecera, lateral e icono.

## Android — requisitos de la PC que compila

1. Node.js + npm.
2. Rust/rustup.
3. Android Studio.
4. Android SDK y Android NDK instalados.
5. Variables `ANDROID_HOME` o `ANDROID_SDK_ROOT` correctamente configuradas.
6. Java/JDK que recomiende la versión actual del Android Gradle Plugin instalada por Tauri.

La primera ejecución de `GENERAR_APK.bat` llama automáticamente a `tauri android init`. Después compila un APK.

Tauri 2 soporta Android 7.0 / API 24 en adelante con esta configuración.

## Firma de producción

### Windows

Un `.exe` puede instalarse sin certificado, pero Windows SmartScreen puede mostrar advertencias de editor desconocido. Para distribución profesional debes comprar/usar un certificado de firma de código y firmar el instalador final. **No guardes claves privadas ni contraseñas dentro de este repositorio.**

### Android

Para actualizaciones estables y publicación debes firmar el APK/AAB con un keystore de producción. Guarda el keystore y su contraseña fuera del proyecto y con copia de seguridad. Perder esa clave puede impedir actualizar una app ya distribuida con la misma identidad.

## Seguridad incorporada

- Awenia sigue siendo local/offline.
- Tauri tiene permisos mínimos (`core:default`) y no se exponen comandos de shell.
- CSP restringe recursos y no permite iframes ni objetos externos.
- No se agrega acceso a cámara, micrófono, geolocalización, USB ni comandos del sistema.
- La ventana cargará el contenido compilado incluido dentro de la aplicación.
- No hay backend público ni puerto que Wendy deba abrir para usar la app instalada.

Ningún software puede prometer seguridad absoluta. Estas medidas reducen superficie de ataque y siguen el principio de mínimo privilegio.

## Archivos importantes

- `src-tauri/tauri.conf.json`: nombre, ventana, CSP, bundle e instalador.
- `src-tauri/Cargo.toml`: núcleo Rust/Tauri.
- `src-tauri/capabilities/default.json`: permisos mínimos.
- `src-tauri/installer/`: icono y recursos visuales del instalador.
- `scripts/BUILD_WINDOWS.ps1`: compilación Windows.
- `scripts/BUILD_ANDROID.ps1`: compilación Android.

## Desarrollo

Para ver Awenia como app de escritorio durante desarrollo:

```powershell
npm install
npm run desktop:dev
```

Para seguir usando la versión navegador durante desarrollo:

```powershell
npm run dev
```

## Nota sobre los datos

Awenia continúa usando almacenamiento web local (IndexedDB) dentro del WebView de cada instalación. Los datos de Windows y Android son independientes. Antes de distribuir ampliamente conviene implementar exportación/restauración completa de backups `.awenia` para mover datos entre dispositivos.
