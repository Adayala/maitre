# Contrato del evento — SPEC-014

## Identidad

- Nombre: `organization.brand.created.v1`.
- Aggregate: Brand / `brandId`.
- Productor: Organization después del commit de Brand.
- Delivery: outbox y semántica al menos una vez de SPEC-217.

## Payload

Envelope estándar de SPEC-217 más `brandId`, `tenantId`, `name`, `status` y `createdAt`.
No incluye configuración completa, imágenes, datos fiscales, credenciales ni información
de contacto. Consumidores consultan la API autorizada si necesitan estado adicional.

## Reglas

- `tenantId` coincide con el aggregate persistido y no proviene del cliente sin validar;
- evento y outbox se confirman en la misma transacción;
- retry no crea un nuevo `eventId` para la misma publicación pendiente;
- consumidores deduplican y fallan cerrado ante versión desconocida;
- el evento informa un hecho, no concede permisos ni activa servicios por sí solo.

## Consumidores y aceptación

Catalog, Branch setup y Analytics pueden crear proyecciones idempotentes. Tests cubren
schema, atomicidad, duplicados, reordenamiento, retry/DLQ, tenant isolation y ausencia de
campos sensibles. Cambios incompatibles crean `v2` y estrategia de coexistencia.
