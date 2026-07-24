# Objetivo — SPEC-130

Definir la API de CashReconciliation para calcular expected server-side, registrar conteos y
aprobar/rechazar reconciliaciones versionadas.

## Criterios de aceptación

### CAD-130-01 — La API de reconciliación define expected summary, counts y comandos con claridad

endpoints de resumen esperado, carga de conteos y comandos `submit`, `approve`, `reject`
quedan definidos con claridad.

### CAD-130-02 — Expected se recalcula server-side y nunca se acepta del cliente

expected se recalcula server-side desde ledger revision congelada y nunca se acepta desde
el cliente.

### CAD-130-03 — Late payments/refunds posteriores a cutoff no mutan aprobadas

late payments/refunds posteriores a cutoff no mutan reconciliaciones aprobadas.

### CAD-130-04 — Reopen es default-deny salvo policies explícitas

reopen está prohibido por default y sólo policies explícitas permiten nueva revisión sin
reescribir historia.

### CAD-130-05 — Segregación, motivos y evidencia quedan auditados en cada transición

segregación de funciones, motivos y evidencia quedan auditados en cada transición.

### CAD-130-06 — La aprobación exige evidencia de pagos tardíos, reopen y precisión decimal

La aprobación exige fixtures de pagos tardíos, reconteos, concurrencia, reopen controlado,
precisión decimal y aislamiento.
