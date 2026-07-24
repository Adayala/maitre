# Objetivo — SPEC-082

Definir OrderItem como unidad autoritativa de fulfillment, pricing congelado y trazabilidad de
cancelaciones/entrega.

## Criterios de aceptación

### CAD-082-01 — El snapshot de OrderItem queda completo e inmutable al submit

snapshot de producto, modifiers, impuestos, quantity y restricciones queda completo e
inmutable al submit.

### CAD-082-02 — El lifecycle operativo de OrderItem es inequívoco

lifecycle operativo, transiciones válidas y terminalidad son inequívocos.

### CAD-082-03 — El fulfillment parcial conserva cantidades exactas

fulfillment parcial conserva cantidades sin pérdida ni duplicación.

### CAD-082-04 — Cancelaciones y cambios posteriores producen ajustes auditados

cancelaciones y cambios posteriores generan ajustes auditados con impacto comercial y
operativo explícito.

### CAD-082-05 — Notas e instrucciones quedan tipadas y sanitizadas

notas e instrucciones se tipan, sanitizan y separan de seguridad alimentaria y PII
innecesaria.

### CAD-082-06 — La aprobación exige evidencia de split, retry y concurrencia

La aprobación exige fixtures de split, cancelación, retry, revisión obsoleta, cross-scope
y concurrencia.
