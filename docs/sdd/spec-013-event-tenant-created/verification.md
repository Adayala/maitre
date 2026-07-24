# Verificación — SPEC-013

## Criterios

### CAD-013-01 — Cada creación confirmada produce una única intención lógica `organization.tenant.created.v1` vinculada al `tenantId`

- [ ] una creación confirmada produce un único hecho lógico;
- [ ] retries físicos no crean nuevas identidades lógicas;
- [ ] el evento queda vinculado al `tenantId` correcto.

### CAD-013-02 — Persistencia de Tenant y outbox son atómicas; rollback no deja evento publicable sin agregado confirmado

- [ ] outbox y agregado confirman o revierten juntos;
- [ ] rollback no deja evento huérfano publicable;
- [ ] reintentos posteriores son recuperables.

### CAD-013-03 — Envelope contiene identidad, versión, timestamps, correlation/causation y actor sanitizado conforme a SPEC-217

- [ ] envelope incluye metadata requerida;
- [ ] actor/correlation/causation están sanitizados;
- [ ] versiones desconocidas se manejan según contrato.

### CAD-013-04 — Payload se limita a tenantId, name, status y createdAt; excluye CUIT, dirección, email, tokens, secrets, plan y snapshots completos

- [ ] payload mínimo contiene sólo campos aprobados;
- [ ] no filtra datos sensibles ni payloads excesivos;
- [ ] consumers no necesitan acceder al agregado completo desde el evento.

### CAD-013-05 — Duplicados físicos conservan eventId y los consumidores deduplican sin asumir orden global ni interpretar el evento como permiso

- [ ] duplicados físicos conservan identidad lógica deduplicable;
- [ ] consumidores toleran reordenamiento;
- [ ] el evento no se usa como autorización.

### CAD-013-06 — Schema, retry, DLQ, compatibilidad y artifacts verifican coexistencia segura; cambios incompatibles crean una versión nueva

- [ ] schema y artifacts están versionados;
- [ ] retry/DLQ tienen comportamiento verificable;
- [ ] breaking changes crean nueva versión compatible en coexistencia.
