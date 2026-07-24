# Objetivo — SPEC-110

Definir la máquina de estados autoritativa de Kitchen para pedidos y tickets de preparación, con transiciones explícitas, orden causal y reglas de corrección sin reescritura histórica.

## Criterios de aceptación

### CAD-110-01 — El workflow declara estados y transiciones permitidas de forma explícita y versionada

Kitchen define un conjunto cerrado de estados operativos y transiciones autorizadas. Las UIs y proyecciones derivan de esa máquina y no inventan caminos alternativos.

### CAD-110-02 — Las transiciones preservan causalidad por item/ticket y rechazan regresiones inválidas

Un avance o corrección de estado debe respetar la revisión autoritativa y la secuencia causal aprobada. Estados stale o regresivos sólo se admiten en workflows correctivos explícitos.

### CAD-110-03 — Realtime y polling distribuyen hints, pero la autoridad sigue en el workflow persistido

Los cambios visibles en Kitchen pueden propagarse por eventos o realtime, pero la verdad permanece en el estado persistido y revalidable. Un hint perdido no reescribe la autoridad.

### CAD-110-04 — Las correcciones manuales, force transitions y bloqueos requieren permiso, reason y auditoría

Cualquier desvío del flujo normal, como force-ready, reopen o cancel correctivo, exige permiso específico, motivo y trazabilidad suficiente.

### CAD-110-05 — El workflow separa preparación, entrega y cierre sin confundirlos con pago o facturación

Kitchen sólo gobierna el estado culinario/operativo. Pago, cierre comercial o fiscalidad viven en sus dominios y no se deducen automáticamente desde Kitchen.

### CAD-110-06 — Concurrencia, replay, gaps e aislamiento Kitchen quedan cubiertos por evidencia determinista

La aprobación requiere pruebas de transiciones concurrentes, replay, hints fuera de orden, visibilidad por branch/station y ausencia de cross-tenant leakage.
