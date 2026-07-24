# Verificación — SPEC-003

## Criterios

### CAD-003-01 — FiscalEntity modela identidad fiscal tenant-scoped

- [ ] FiscalEntity requiere `tenantId` válido;
- [ ] acepta `cuit`, `legalName` y `taxCondition` sólo en formatos aprobados;
- [ ] no embebe comprobantes ni branches hijas;
- [ ] consultas devuelven sólo entidades fiscales del tenant autorizado.

### CAD-003-02 — CUIT y condición tributaria son válidos y consistentes

- [ ] CUIT válido pasa checksum y formato;
- [ ] CUIT inválido o duplicado dentro del Tenant falla;
- [ ] el mismo CUIT en tenants distintos sigue la política aprobada explícitamente;
- [ ] taxCondition rechaza valores fuera del catálogo.

### CAD-003-03 — El material criptográfico se gobierna sin exponer secretos

- [ ] certificados vencidos, inválidos o incompatibles fallan;
- [ ] la clave privada no se persiste en texto plano en tablas operativas;
- [ ] sólo se conservan metadatos, referencias seguras y vencimientos necesarios;
- [ ] logs y errores no exponen secreto ni contenido sensible.

### CAD-003-04 — Los puntos de venta se relacionan con trazabilidad explícita

- [ ] la asociación a puntos de venta usa referencias claras y lifecycle revisable;
- [ ] numeraciones duplicadas o inconsistentes fallan según política aprobada;
- [ ] la relación entre FiscalEntity y FiscalPoint queda trazada para auditoría.

### CAD-003-05 — FiscalEntity sólo puede ser usada dentro del mismo Tenant

- [ ] Branch de Tenant A no puede referenciar FiscalEntity de Tenant B;
- [ ] constraints same-tenant fallan en aplicación y DB;
- [ ] leer o mutar FiscalEntity de otro tenant devuelve error autorizado sin filtrar existencia.

### CAD-003-06 — Mutaciones fiscales preservan auditoría, lifecycle y aislamiento

- [ ] lifecycle fiscal sólo permite transiciones declaradas;
- [ ] cambios relevantes usan control de concurrencia aprobado;
- [ ] auditoría registra actor, timestamp y motivo cuando aplique;
- [ ] existe evidencia enlazada en tests, migraciones y revisión.
