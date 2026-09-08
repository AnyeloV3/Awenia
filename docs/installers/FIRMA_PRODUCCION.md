# Firma de producción — guía de seguridad

## Regla principal

Nunca subas ni compartas en Git/ZIP público:

- archivos `.pfx` / `.p12`
- keystores `.jks` / `.keystore`
- contraseñas de firma
- claves privadas
- tokens de tiendas

## Windows

El proyecto genera un instalador NSIS. Para que aparezca un editor verificado y reducir alertas de SmartScreen necesitas un certificado de firma de código válido. La firma se realiza sobre el `.exe` final con herramientas de Microsoft/certificado del propietario.

## Android

Para uso privado puedes instalar APKs firmados por el proceso de desarrollo. Para distribución estable debes crear un keystore de producción y configurar la firma en el proyecto Android generado por Tauri.

Conserva dos copias seguras del keystore en ubicaciones separadas.
