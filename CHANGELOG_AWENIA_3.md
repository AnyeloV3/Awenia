# Awenia V3

V3 conserva todo el frontend y las funciones de V2 y agrega el módulo Caja.

## Caja
- Ingresar dinero al fondo de materiales.
- Retirar dinero.
- Registrar compras con proveedor y desglose tipo factura.
- Cada línea registra material, cantidad, unidad, costo unitario y total.
- Las compras vinculadas a materiales actualizan el inventario local.
- Al borrar una compra, Awenia revierte la cantidad añadida al inventario.
- Cada venta crea una reserva automática equivalente al costo de materiales de esa venta.
- Al borrar una venta, se restaura el stock y se elimina su reserva automática.
- Saldo actual, reservas, salidas del mes y costo estimado de reposición.
- Planificador por producto: costo exacto utilizado vs. efectivo necesario para comprar presentaciones completas.
- Comparación de caja disponible contra efectivo necesario.
- Caja incluida en búsqueda global y exportaciones Word, PDF y Excel.

## Correcciones de interfaz
- Portada corregida para evitar que “Tu emprendimiento” salga de la tarjeta.
- Mejoras responsive en textos, botones, tarjetas y tablas.
- Navegación móvil convertida en barra inferior desplazable para mantener acceso a todas las secciones.
- Conserva las 4 paletas pastel, modo claro/oscuro y animaciones de V2.
