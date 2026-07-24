# Objetivo — SPEC-131

Definir la API de Discounts para versionar políticas, evaluar elegibilidad y aplicar descuentos
server-side con stacking/caps reproducibles.

## Criterios de aceptación

### CAD-131-01 — La API de Discounts define CRUD draft, publish/version y evaluate/apply con claridad

CRUD de DRAFT, publish/version/deactivate, evaluate y `apply` quedan definidos con
claridad.

### CAD-131-02 — Sólo policies autorizadas publican; operadores aplican versiones publicadas

sólo roles/policies autorizadas publican versiones; operadores aplican versiones ya
publicadas sin mutar la policy.

### CAD-131-03 — Evaluate es side-effect free; apply revalida transaccionalmente

`evaluate` es explicable y side-effect free; `apply` revalida en transacción completa.

### CAD-131-04 — El servidor recalcula stacking, caps, elegibilidad y usage

cliente no aporta importes autoritativos y el servidor recalcula stacking, caps,
eligibility y usage.

### CAD-131-05 — Override requiere permiso separado y threshold auditado

override requiere permiso separado, reason y approval threshold auditado.

### CAD-131-06 — La aprobación exige evidencia de vigencia, stacking, usage y RBAC

La aprobación exige fixtures de vigencia, timezone, stacking, límites, uso repetido,
concurrencia, RBAC y aislamiento.
