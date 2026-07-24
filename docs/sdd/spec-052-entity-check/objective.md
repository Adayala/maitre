# Objetivo — SPEC-052

## Propósito

Check es la cuenta comercial autoritativa de una Visit. Consolida snapshots económicos
reconciliables sin asumir autoridad fiscal ni modelar implícitamente división de cuenta.

## Resultado esperado

### CAD-052-01 — Check mantiene unicidad por Visit y coherencia de scope monetario

Existe como máximo un Check por Visit en I0 y comparte tenant, Branch y currency con su
contexto.

### CAD-052-02 — Las líneas económicas congelan snapshots de sus fuentes

Líneas y ajustes congelan identificadores, versiones, cantidades y dinero de sus fuentes.

### CAD-052-03 — Los totales se derivan con política monetaria explícita

gross, descuentos, impuestos estimados, cargos, propinas, paid y balance se derivan con
MoneyPolicy explícita y sin float.

### CAD-052-04 — El lifecycle de Check es acotado y auditado

El ciclo autoritativo es `OPEN → PAYMENT_PENDING → SETTLED`, con `VOID` terminal bajo
precondiciones auditadas.

### CAD-052-05 — La liquidación comercial no absorbe autoridad fiscal

SETTLED exige balance cero y ausencia de Payments ambiguos o pendientes; Invoice conserva
autoridad fiscal separada.

### CAD-052-06 — La aprobación exige evidencia monetaria, concurrente y reconciliable

La aprobación exige fixtures de redondeo, concurrencia, ajustes, liquidación, void,
idempotencia y aislamiento.
