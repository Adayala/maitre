# Objetivo — SPEC-014

## Propósito

Publicar la creación confirmada de una Brand para consumidores tenant-scoped, preservando
atomicidad, payload mínimo y semántica idempotente.

## Criterios de aceptación

### CAD-014-01 — El hecho se identifica como `organization.brand.created.v1` con `brandId` estable

El hecho se identifica como `organization.brand.created.v1`, agregado Brand y `brandId` estable.

### CAD-014-02 — Brand y outbox se confirman en una transacción

Brand y outbox se confirman en una transacción; retry de la misma publicación pendiente conserva
eventId.

### CAD-014-03 — `tenantId` proviene del agregado validado y ninguna entrada cliente decide el scope

`TenantId` proviene del agregado validado y coincide con Brand; ninguna entrada cliente no validada
decide el scope.

### CAD-014-04 — El payload incluye sólo brandId, tenantId, name, status y createdAt

Payload incluye sólo brandId, tenantId, name, status y createdAt; excluye configuración, imágenes,
fiscalidad, credenciales y contactos.

### CAD-014-05 — Consumidores deduplican, toleran reordenamiento y el evento no concede permisos

Consumidores deduplican, toleran reordenamiento y fallan cerrado ante versión desconocida; el evento
no concede permisos ni activa servicios.

### CAD-014-06 — Schema, retry, DLQ, aislamiento y compatibilidad se verifican con coexistencia explícita

Schema, retry/DLQ, aislamiento y compatibilidad se verifican; cambios incompatibles crean v2 con
coexistencia explícita.
