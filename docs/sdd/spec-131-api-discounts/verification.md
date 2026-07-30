# Verificación — SPEC-131

## Criterios

Estado I0: create/list/detail, publish/deactivate, evaluate y registro de application están
materializados. Los criterios que dependen del engine avanzado continúan pendientes y se siguen en
un ticket separado; no bloquean la verificación del walking skeleton.

### CAD-131-01 — La API de Discounts define CRUD draft, publish/version y evaluate/apply con claridad

- [x] create/list/detail, publish/deactivate, evaluate y apply I0 tienen surface clara.

### CAD-131-02 — Sólo policies autorizadas publican; operadores aplican versiones publicadas

- [x] sólo policy roles publican; operadores aplican versiones ya publicadas.

### CAD-131-03 — Evaluate es side-effect free; apply revalida transaccionalmente

- [x] evaluate es side-effect free y apply exige una policy publicada.
- [ ] apply revalida transaccionalmente stacking/caps/usage y el target dependiente.

### CAD-131-04 — El servidor recalcula stacking, caps, elegibilidad y usage

- [ ] cálculo server-side rechaza importes autoritativos del cliente.

### CAD-131-05 — Override requiere permiso separado y threshold auditado

- [ ] overrides requieren permiso, reason y threshold auditados.

### CAD-131-06 — La aprobación exige evidencia de vigencia, stacking, usage y RBAC

- [ ] fixtures cubren vigencia, timezone, stacking, usage y concurrencia.
