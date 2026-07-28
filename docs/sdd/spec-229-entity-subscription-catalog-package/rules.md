# Rules — SPEC-229

- Todo código referenciado debe existir y estar activo al aplicar el paquete.
- Las cantidades deben ser enteros positivos y sólo se admiten en ítems `QUANTITY`.
- Los ítems no tenant usan la sucursal seleccionada por el operador.
- Aplicar es idempotente: crea faltantes y ajusta cantidades; no duplica contrataciones.
- El paquete no es una suscripción paralela ni bloquea altas o bajas individuales posteriores.
- El precio es estimado y se calcula desde los ítems, no se duplica en el paquete.
