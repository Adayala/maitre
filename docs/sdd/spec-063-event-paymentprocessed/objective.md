# Objetivo — SPEC-063

Definir eventos inequívocos para cada autorización, captura, terminal o movimiento contable
de Payment/Refund, sin conservar el nombre genérico PaymentProcessed.

## Criterios de aceptación

### CAD-063-01 — El registry admite sólo los nombres de eventos aprobados

El registry admite únicamente los seis nombres/versiones aprobados.

### CAD-063-02 — Cada evento fija trigger, aggregate e identidad operativa inequívocos

Cada evento posee trigger exacto, aggregate, operation identity, partition key y revisión
definidos.

### CAD-063-03 — Los importes y referencias se exponen sólo cuando son necesarios

amount/currency y referencias aparecen sólo cuando son necesarias y respetan MoneyPolicy y
redacción.

### CAD-063-04 — La conciliación ambigua no publica éxitos espurios

timeout ambiguo no publica éxito; receipt conciliado produce como máximo un hecho lógico
por transición/operación.

### CAD-063-05 — Los consumidores no retroceden terminales ni infieren datos prohibidos

Consumidores deduplican, no retroceden terminales y no infieren Invoice, autorización ni
identidad del instrumento.

### CAD-063-06 — La aprobación exige evidencia de parciales, privacidad y compatibilidad

La aprobación exige fixtures de parciales, retry, reorder, refund, CashMovement,
compatibilidad, privacidad y aislamiento.
