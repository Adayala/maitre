# Objetivo — SPEC-059

Definir la frontera de pagos y refunds idempotentes, reconciliables y sin datos de
instrumento sensibles, incluyendo un ingreso seguro para callbacks de proveedor.

## Criterios de aceptación

### CAD-059-01 — La API define con precisión rutas, schemas y permisos de Payment/Refund

create/list/detail y comandos de Payment/Refund tienen rutas, schemas, permisos y
revisiones explícitos.

### CAD-059-02 — Cada operación conserva identidad idempotente extremo a extremo

Cada operación usa identidad idempotente end-to-end y no confía en estado aportado por
browser.

### CAD-059-03 — Los importes se validan contra Check y evitan sobrepago

amount, currency, tip, captura y refunds se validan contra Check/revisión y evitan
sobrepago.

### CAD-059-04 — Los callbacks validan autenticidad antes de transicionar

callbacks validan provider, firma, timestamp/replay e identidad antes de deduplicar o
transicionar.

### CAD-059-05 — La conciliación ambigua y el método CASH preservan seguridad operativa

timeout ambiguo exige conciliación; CASH produce exactamente un CashMovement y ninguna
respuesta/log contiene datos prohibidos.

### CAD-059-06 — La aprobación exige evidencia de retry, redacción y aislamiento

La aprobación exige fixtures de retry, eventos desordenados, parciales, redacción, RBAC,
auditoría, outbox y aislamiento.
