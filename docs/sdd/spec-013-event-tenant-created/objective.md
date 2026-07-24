# Objetivo — SPEC-013

## Propósito

Publicar el hecho confirmado de creación de Tenant para inicializar proyecciones desacopladas sin
convertir el evento en autorización ni exponer datos sensibles del agregado.

## Criterios de aceptación

### CAD-013-01 — Cada creación confirmada produce una única intención lógica `organization.tenant.created.v1`

Cada creación confirmada produce una única intención lógica `organization.tenant.created.v1`
vinculada al `tenantId`.

### CAD-013-02 — Persistencia de Tenant y outbox son atómicas

Persistencia de Tenant y outbox son atómicas; rollback no deja evento publicable sin agregado
confirmado.

### CAD-013-03 — El envelope contiene identidad, versión, timestamps y actor sanitizado

Envelope contiene identidad, versión, timestamps, correlation/causation y actor sanitizado conforme a
SPEC-217.

### CAD-013-04 — El payload se limita a tenantId, name, status y createdAt

Payload se limita a tenantId, name, status y createdAt; excluye CUIT, dirección, email, tokens,
secrets, plan y snapshots completos.

### CAD-013-05 — Los consumidores deduplican sin asumir orden global ni usar el evento como permiso

Duplicados físicos conservan eventId y los consumidores deduplican sin asumir orden global ni
interpretar el evento como permiso.

### CAD-013-06 — Schema, retry, DLQ y compatibilidad verifican coexistencia segura

Schema, retry, DLQ, compatibilidad y artifacts verifican coexistencia segura; cambios incompatibles
crean una versión nueva.
