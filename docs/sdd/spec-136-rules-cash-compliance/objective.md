# Objetivo — SPEC-136

Definir políticas versionadas y un evaluador explicable de cash compliance que preserve ledger y
evidencia sin automatizar juicios de fraude.

## Criterios de aceptación

### CAD-136-01 — PolicyVersion conserva owner, provenance, vigencia y thresholds trazables

PolicyVersion conserva owner, provenance, vigencia, thresholds, moneda, reviewer y
fixtures trazables.

### CAD-136-02 — Findings explicables incluyen rule/version, evidence window y classification

findings explicables incluyen rule/version, evidence window, confidence y access
classification.

### CAD-136-03 — Fraccionamiento, diferencias y autoaprobación son señales, no prueba concluyente

fraccionamiento, diferencias repetidas y autoaprobación se modelan como señales, no como
prueba concluyente.

### CAD-136-04 — Findings requieren revisión humana, resolution/appeal y access restringido

findings requieren revisión humana, resolución/appeal y acceso restringido según
clasificación.

### CAD-136-05 — `NOT_CONFIGURED` sólo deniega límites obligatorios y no muta ledger

sin policy aplicable, `NOT_CONFIGURED` sólo deniega operaciones cuyo límite sea obligatorio
y no muta el ledger.

### CAD-136-06 — La aprobación exige evidencia de fraccionamiento, policy change y default seguro

La aprobación exige fixtures de fraccionamiento, diferencias reiteradas, autoaprobación,
cambios de política, datos incompletos y default seguro.
