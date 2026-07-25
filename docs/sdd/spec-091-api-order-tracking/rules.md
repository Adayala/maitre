# Rules — SPEC-091

- Tracking es de sólo lectura y no autoriza comandos posteriores.
- Capability pública se almacena como hash y se separa de menu/bill/payment.
- Respuesta declara `aggregateRevision`, `projectionCursor`, `asOf`, `lastConfirmedAt` y `freshness`.
- Eventos tardíos o duplicados no retroceden estados terminales.
- Payload público omite precios, PII, notas internas e instrucciones sensibles.
- Acceso interno valida tenant, permiso y scope de sucursal sobre la orden.
