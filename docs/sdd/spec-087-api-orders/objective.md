# Objetivo — SPEC-087

Definir la API autoritativa para crear, consultar, enviar y cancelar Orders con snapshots,
idempotencia y control de revisión.

## Criterios de aceptación

### CAD-087-01 — La API define rutas, comandos y alcances con autoridad inequívoca

rutas, comandos y alcance por visit/order quedan definidos con autoridad inequívoca.

### CAD-087-02 — Create y submit usan idempotencia; mutaciones versionadas usan revisión

create y submit usan `Idempotency-Key`, mientras que las mutaciones versionadas usan `If-Match` o
revisión esperada.

### CAD-087-03 — El servidor conserva autoridad sobre importes y snapshots

el servidor calcula importes desde catálogo/snapshots y rechaza precios o totales
autoritativos del cliente.

### CAD-087-04 — Los conflictos devuelven contratos de error estables

conflictos de catálogo, ciclo de vida, revisión, alcance e idempotencia devuelven contratos de
error estables.

### CAD-087-05 — Submit coordina Order, KitchenTicket y outbox con atomicidad

submit coordina Order, KitchenTicket y outbox sin perder atomicidad ni reescribir
historial.

### CAD-087-06 — La aprobación exige evidencia de retry, catálogo y concurrencia

La aprobación exige fixtures de retry, catálogo cambiado, cross-scope, cancelación,
concurrencia y auditoría.
