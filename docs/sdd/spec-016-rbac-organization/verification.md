# Verificación — SPEC-016

## Criterios

### CAD-016-01 — Toda acción resuelve identidad, Membership activa, capability y alcance del tenant autoritativo antes de evaluar reglas de dominio

- [ ] toda decisión parte de identidad y membership activas;
- [ ] capabilities y alcances se resuelven server-side;
- [ ] reglas de dominio no se evalúan antes de autorización base.

### CAD-016-02 — La matriz OWNER/ADMIN/MANAGER produce allow/deny determinista por recurso/acción; EMPLOYEE requiere rol funcional y alcance explícito

- [ ] OWNER/ADMIN/MANAGER producen decisiones deterministas;
- [ ] EMPLOYEE sólo accede con rol funcional y alcance explícito;
- [ ] no existen huecos implícitos de autoridad.

### CAD-016-03 — El alcance por sucursal limita Brand/FiscalEntity/Branch/Salon/Table según contrato y todo acceso cross-tenant permanece denegado

- [ ] el alcance por sucursal limita recursos según contrato;
- [ ] acceso cross-tenant permanece denegado;
- [ ] conocer IDs no elude el alcance.

### CAD-016-04 — ADMIN no crea OWNER ni delega capabilities que no posee; self-grant, elevación y confused deputy son rechazados

- [ ] ADMIN no puede crear OWNER ni autoelevarse;
- [ ] no delega capabilities que no posee;
- [ ] confused deputy y self-grant fallan cerrado.

### CAD-016-05 — Membership suspendida/revocada deja de autorizar sin depender de claims editables o caches stale; repositorio/RLS sólo agregan defensa

- [ ] revocación o suspensión corta acceso de forma efectiva;
- [ ] claims editables o caches stale no mantienen permisos;
- [ ] RLS/repositorio sólo agregan defensa en profundidad.

### CAD-016-06 — Denegaciones usan 401/403/404 sin enumeración y las decisiones sensibles registran actor, tenant, acción, recurso y correlation ID sin secretos

- [ ] respuestas 401/403/404 no enumeran recursos;
- [ ] decisiones sensibles registran actor, tenant, acción, recurso y correlation ID;
- [ ] logs y auditoría no exponen secretos.
