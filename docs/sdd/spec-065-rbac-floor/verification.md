# Verificación — SPEC-065

## Criterios

### CAD-065-01 — Cada acción API se mapea a un permiso canónico único

- [ ] cada ruta/comando tiene un permiso y ninguna acción comparte un permiso sensible
      por conveniencia.

### CAD-065-02 — Toda decisión combina identidad, membership, permiso y alcance vigentes

- [ ] Membership, permiso, revision y cada borde de alcance producen allow/deny estable.

### CAD-065-03 — Los perfiles operativos son assignments mínimos, no jerarquías implícitas

- [ ] rol nominal sin assignment queda denegado;
- [ ] OWNER/ADMIN no hacen wildcard.

### CAD-065-04 — RBAC no reemplaza límites monetarios ni invariantes de dominio

- [ ] ownership, límites acumulados e invariantes siguen aplicando tras allow RBAC.

### CAD-065-05 — Las acciones sensibles exigen permiso dedicado y controles reforzados

- [ ] step-up, reason, expiry, dual control y uso único cubren cada override.

### CAD-065-06 — La aprobación exige evidencia de allow/deny, auditoría y aislamiento

- [ ] self-grant/self-approval, stale auth, paginación, `404`, auditoría y
      cross-tenant/cross-Branch fallan cerrado.
