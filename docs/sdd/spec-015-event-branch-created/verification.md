# Verificación — SPEC-015

## Criterios

### CAD-015-01 — El hecho se identifica como `organization.branch.created.v1`, agregado Branch y `branchId` estable

- [ ] nombre de evento, agregado y `branchId` coinciden con contrato;
- [ ] una creación confirmada produce una sola identidad lógica;
- [ ] retries físicos no generan nuevas identidades lógicas.

### CAD-015-02 — Branch y outbox son atómicos; una falla de consumidor no revierte la creación y retry conserva la identidad lógica

- [ ] agregado y outbox confirman o revierten juntos;
- [ ] falla de consumidor no revierte la Branch ya creada;
- [ ] retry conserva la identidad lógica del evento.

### CAD-015-03 — tenantId, brandId y fiscalEntityId pertenecen al mismo Tenant y timezone es una zona IANA válida fijada al ocurrir el hecho

- [ ] same-tenant entre referencias queda verificado antes de publicar;
- [ ] timezone publicada es válida y estable;
- [ ] inconsistencias fallan antes del outbox.

### CAD-015-04 — Payload excluye dirección, teléfono y datos sensibles, y no presenta salons, tables, subscription u onboarding como completados

- [ ] payload mínimo excluye dirección, teléfono y secretos;
- [ ] no afirma completion de onboarding ni recursos hijos;
- [ ] consumers no tratan el evento como snapshot completo.

### CAD-015-05 — Consumidores deduplican por eventId, manejan orden parcial y no usan el payload como prueba de permisos

- [ ] deduplicación por `eventId` es posible;
- [ ] consumidores toleran orden parcial;
- [ ] el payload no se interpreta como autorización.

### CAD-015-06 — Schema, outbox, retry/DLQ, aislamiento, payload mínimo y compatibilidad poseen resultados verificables; breaking changes crean nueva versión

- [ ] schema y payload mínimo tienen evidencia verificable;
- [ ] retry/DLQ y aislamiento quedan cubiertos por pruebas;
- [ ] cambios incompatibles crean nueva versión explícita.
