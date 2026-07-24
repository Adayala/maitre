# Verificación — SPEC-131

## Criterios

### CAD-131-01 — La API de Discounts define CRUD draft, publish/version y evaluate/apply con claridad

- [ ] CRUD draft, publish/version/deactivate, evaluate y apply tienen surface clara.

### CAD-131-02 — Sólo policies autorizadas publican; operadores aplican versiones publicadas

- [ ] sólo policy roles publican; operadores aplican versiones ya publicadas.

### CAD-131-03 — Evaluate es side-effect free; apply revalida transaccionalmente

- [ ] evaluate es side-effect free y apply revalida transaccionalmente.

### CAD-131-04 — El servidor recalcula stacking, caps, elegibilidad y usage

- [ ] cálculo server-side rechaza importes autoritativos del cliente.

### CAD-131-05 — Override requiere permiso separado y threshold auditado

- [ ] overrides requieren permiso, reason y threshold auditados.

### CAD-131-06 — La aprobación exige evidencia de vigencia, stacking, usage y RBAC

- [ ] fixtures cubren vigencia, timezone, stacking, usage y concurrencia.
