# Objetivo — SPEC-086

Definir KitchenTicket como agregado autoritativo de producción por station derivado de Order submit
sin duplicar autoridad comercial.

## Criterios de aceptación

### CAD-086-01 — KitchenTicket fija identidad, alcance operativo y creación idempotente por order revision y station

identidad, alcance operativo y regla de creación idempotente por order revision + station quedan
definidos.

### CAD-086-02 — Los snapshots culinarios excluyen precio y PII innecesaria

snapshots culinarios mínimos, líneas y redacción de datos excluyen precio y PII
innecesaria.

### CAD-086-03 — Comandos y revisiones respetan monotonicidad de estado

comandos, revisiones esperadas y monotonicidad de estado son inequívocos.

### CAD-086-04 — Replay y reorder convergen sin retroceder terminales

replay, duplicados y eventos fuera de orden convergen sin retroceder terminales.

### CAD-086-05 — Transferencias y repriorizaciones quedan auditadas sin ownership ambiguo

transferencias, cancelaciones y repriorizaciones quedan auditadas sin ownership simultáneo
ambiguo.

### CAD-086-06 — La aprobación exige evidencia de split, transfer y reorder

La aprobación exige fixtures de split, retry, transfer, cancelación, reorder y
aislamiento.
