# Objetivo — SPEC-184

Definir el conector POS con ownership matrix obligatoria, convergencia determinística y conflicto
explícito cuando no exista autoridad única.

## Criterios de aceptación

### CAD-184-01 — OwnershipMatrix es obligatoria por dominio y field

existe OwnershipMatrix obligatoria por catálogo/order/payment/closure y por field.

### CAD-184-02 — Sólo hay autoridad única o merge determinista por field

sólo un lado es autoridad salvo `MERGED` con merge function determinista.

### CAD-184-03 — Echo suppression y delete mapping siguen origin/revision y capability

echo suppression usa `origin/revision` y delete mapea a archive/tombstone según
capability.

### CAD-184-04 — External IDs son únicos por installation/resource y no se reutilizan

external IDs son únicos por installation/resource y nunca se reutilizan.

### CAD-184-05 — Replay, backfill y out-of-order convergen y conflictos quedan explícitos

backfill, replay y eventos fuera de orden convergen por version/checkpoint; conflictos
quedan en `CONFLICT` explícito y no hay last-write-wins implícito.

### CAD-184-06 — La aprobación exige evidencia de ownership, merge, conflict y convergencia

La aprobación exige fixtures de ownership, merge determinista, out-of-order, conflict,
tombstone/archive y PASS gate del provider.
