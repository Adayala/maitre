# Objetivo — SPEC-176

Definir la API autoritativa para crear, configurar, activar, deshabilitar y upgradear integraciones
sin exponer secretos ni habilitar configuraciones arbitrarias.

## Criterios de aceptación

### CAD-176-01 — La API expone lifecycle explícito para create/configure/activate/disable/upgrade

la API expone create/list/detail/configure/activate/disable/upgrade con boundaries
explícitos de lifecycle.

### CAD-176-02 — Config valida adapter version y bloquea URLs arbitrarias salvo capability aprobada

config se valida por adapter version y no acepta provider base URLs arbitrarias salvo
capability explícita y aprobada.

### CAD-176-03 — Inputs secretos entran por canal dedicado y se convierten en refs opacas

inputs secretos usan canal dedicado y se convierten a opaque references que nunca se
reexponen.

### CAD-176-04 — Mutaciones usan idempotencia y concurrencia optimista

mutaciones usan idempotency y `If-Match`/expected revision según corresponda.

### CAD-176-05 — Activate exige PASS gate, ownership, credentials y capabilities válidas

activate exige spike `PASS`, ownership matrix, credentials y capabilities válidas, además
de test permitido; disable revoca recepción/jobs sin borrar runs.

### CAD-176-06 — La aprobación exige evidencia de config validation, activate gates y upgrades

La aprobación exige fixtures de config validation, secret channel, activate gates, disable
semantics, concurrencia y upgrades.
