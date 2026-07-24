# Objetivo — SPEC-143

Definir TaxRate como catálogo normativo versionado y autoritativo para tasas/impuestos fiscales,
separando la definición oficial de los mapeos operativos de tenant o producto.

## Criterios de aceptación

### CAD-143-01 — Cada tax rate se identifica por clave normativa completa y versionada

cada tax rate queda identificado por jurisdiction, tax code, treatment, effective interval
y normative source version.

### CAD-143-02 — No existen solapamientos de vigencia y versiones usadas se vuelven inmutables

no existen solapamientos de vigencia para la misma clave normativa; una versión publicada y
usada por invoices se vuelve inmutable.

### CAD-143-03 — Tenants sólo mapean categorías internas a códigos oficiales permitidos

tenants y brands sólo pueden mapear categorías internas a códigos oficiales permitidos; no
crean ni alteran alícuotas oficiales.

### CAD-143-04 — Cambios normativos crean nuevas versiones sin reescribir invoices emitidas

cambios retroactivos o normativos crean nuevas versiones y workflow de revisión, sin
reescribir invoices ya emitidas.

### CAD-143-05 — Ausencia o incompatibilidad normativa bloquea emisión fiscal explícitamente

ausencia de código vigente, fuente aprobada o compatibilidad con el comprobante bloquea
emisión fiscal con error semántico explícito.

### CAD-143-06 — La aprobación exige evidencia de vigencias, conflictos y decimales exactos

La aprobación exige fixtures de vigencias, conflictos, redondeo decimal exacto, mappings
permitidos y preservación histórica.
