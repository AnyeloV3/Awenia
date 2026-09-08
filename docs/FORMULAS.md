# Fórmulas migradas desde el Excel original

La calculadora de Awenia conserva estas reglas:

- Costo material usado = (Precio de compra / Cantidad comprada) × Cantidad usada
- Costo mano de obra = Horas × Mano de obra por hora
- Subtotal directo = Materiales + Mano de obra
- Costos indirectos = Subtotal directo × % indirectos
- Costo total real = Subtotal directo + Costos indirectos
- Ganancia objetivo = Costo total real × % ganancia
- Precio antes de comisión = Costo total real + Ganancia objetivo
- Comisión porcentual = Precio antes / (1 - comisión) - Precio antes
- Precio matemático = Precio antes + Comisión
- Precio sugerido = redondeo hacia arriba al múltiplo comercial configurado

Awenia agrega indicadores administrativos sin modificar la fórmula anterior:

- Ganancia bruta: precio de venta - materiales - comisión de pago.
- Ganancia del negocio: precio de venta - costo total real - comisión de pago.
- Dinero al bolsillo: pago por trabajo + ganancia del negocio.
- Margen efectivo: ganancia del negocio / precio de venta.
