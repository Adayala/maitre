# Verificación — SPEC-055

## Criterios

### CAD-055-01 — La API separa claramente contexto autenticado, alcance y datos de cliente

- [ ] body no puede sustituir tenant, sucursal ni actor.

### CAD-055-02 — La apertura de Visit coordina idempotencia y seating inicial atómico

- [ ] create reintentado devuelve la misma Visit;
- [ ] dos seat iniciales concurrentes sobre una Table producen un ganador.

### CAD-055-03 — Los comandos del ciclo de vida exigen precondiciones, permisos y revisión

- [ ] matriz de comandos, permisos, revisions y blockers de cierre.

### CAD-055-04 — Las lecturas preservan paginación estable y ocultamiento por alcance

- [ ] paginación y filtros son estables y respetan el alcance.

### CAD-055-05 — Los errores distinguen causa sin filtrar información sensible

- [ ] cada condición produce el Problem Details previsto sin enumeración.

### CAD-055-06 — La aprobación exige evidencia de RBAC, atomicidad y aislamiento

- [ ] RBAC, `If-Match`, auditoría, outbox, rollback e aislamiento fallan cerrado.
