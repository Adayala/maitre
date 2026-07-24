# Verificación — SPEC-014

## Criterios

### CAD-014-01 — El hecho se identifica como `organization.brand.created.v1`, agregado Brand y `brandId` estable

- [ ] nombre de evento, agregado y `brandId` coinciden con el contrato;
- [ ] una creación confirmada produce una única identidad lógica;
- [ ] retries físicos no cambian esa identidad lógica.

### CAD-014-02 — Brand y outbox se confirman en una transacción; retry de la misma publicación pendiente conserva eventId

- [ ] agregado y outbox son atómicos;
- [ ] retry conserva `eventId`;
- [ ] no existe evento publicable sin Brand confirmada.

### CAD-014-03 — `tenantId` proviene del agregado validado y coincide con Brand; ninguna entrada cliente no validada decide el scope

- [ ] `tenantId` proviene del agregado validado;
- [ ] el scope no depende de body no validado;
- [ ] inconsistencias de scope fallan antes de publicar.

### CAD-014-04 — Payload incluye sólo brandId, tenantId, name, status y createdAt; excluye configuración, imágenes, fiscalidad, credenciales y contactos

- [ ] payload contiene sólo campos mínimos aprobados;
- [ ] excluye configuración, secretos y datos sensibles;
- [ ] consumidores obtienen resto de contexto por APIs o proyecciones autorizadas.

### CAD-014-05 — Consumidores deduplican, toleran reordenamiento y fallan cerrado ante versión desconocida; el evento no concede permisos ni activa servicios

- [ ] consumidores deduplican y toleran reordenamiento;
- [ ] versión desconocida falla cerrado;
- [ ] el evento no otorga permisos ni habilita servicios por sí mismo.

### CAD-014-06 — Schema, retry/DLQ, aislamiento y compatibilidad se verifican; cambios incompatibles crean v2 con coexistencia explícita

- [ ] schema y artifacts están versionados;
- [ ] retry/DLQ tienen evidencia verificable;
- [ ] breaking changes crean nueva versión con coexistencia explícita.
