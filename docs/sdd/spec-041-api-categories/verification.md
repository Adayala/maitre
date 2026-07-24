# Verificación — SPEC-041

## Criterios

### CAD-041-01 — Create/list usan `menuRevisionId` DRAFT coherente con Tenant y ocultan alcances cross-tenant

- [ ] create/list sólo opera sobre revisión/tenant autorizado;
- [ ] `menuRevisionId` debe ser DRAFT coherente;
- [ ] alcances cross-tenant permanecen ocultos.

### CAD-041-02 — Nombre normalizado único y sortOrder estable producen conflictos deterministas

- [ ] nombre normalizado duplicado falla;
- [ ] sortOrder produce orden estable;
- [ ] los conflictos son deterministas.

### CAD-041-03 — PATCH exige `If-Match` de revisión/categoría y sólo modifica DRAFT

- [ ] PATCH sobre published/stale falla;
- [ ] PATCH exige `If-Match`;
- [ ] sólo modifica DRAFT.

### CAD-041-04 — Reorder recibe conjunto completo esperado, rechaza IDs faltantes/duplicados/cross-revision y se aplica atómicamente

- [ ] reorder faltante/duplicado/cross-revision falla atómicamente;
- [ ] reorder válido produce orden total estable;
- [ ] la operación aplica el conjunto completo esperado.

### CAD-041-05 — Ocultar/remover de DRAFT no borra Category publicada ni OrderItems; no existe DELETE físico

- [ ] ocultar/remover DRAFT preserva snapshots/orders;
- [ ] Category publicada no se borra;
- [ ] no existe DELETE físico.

### CAD-041-06 — RBAC, auditoría, 404/409/412/422 y OpenAPI poseen evidencia de concurrencia, ordering y aislamiento

- [ ] RBAC/errors/OpenAPI coinciden con contrato;
- [ ] auditoría y ordering poseen evidencia;
- [ ] concurrencia y aislamiento quedan cubiertos.
