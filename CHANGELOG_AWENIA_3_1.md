# Awenia 3.1 — Optimización local y responsive

- Mantiene todo Awenia V3: Caja, ventas, productos, fotos, categorías, materiales, proveedores, inventario, pedidos, clientes, producción, notas, estadísticas y exportaciones.
- Responsive reforzado para 4K, PC, laptop 1366×768, tablets Lenovo landscape/portrait, móviles y pantallas desde 280 px.
- Navegación inferior táctil en móvil.
- Tablas con scroll táctil seguro sin romper el layout.
- Buscador global con debounce de 180 ms para evitar trabajo excesivo mientras se escribe.
- Fotos locales validadas por MIME, limitadas a 4 MB y optimizadas a WebP/máximo 1600 px antes de guardarse en IndexedDB.
- Animaciones conservadas; se priorizan transform/opacity y composición GPU.
- Content visibility/contain para reducir render fuera de pantalla.
- Cabeceras locales de endurecimiento: nosniff, DENY frame, no-referrer y Permissions-Policy restrictiva.
- Next Strict Mode y sin cabecera X-Powered-By.
- Viewport accesible con zoom permitido hasta 5×.
