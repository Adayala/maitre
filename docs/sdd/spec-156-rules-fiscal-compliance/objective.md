# Objetivo — SPEC-156

Definir el marco de compliance fiscal que versiona fuentes normativas, findings y bloqueos seguros
antes de permitir operación productiva.

## Criterios de aceptación

### CAD-156-01 — `NormativeSourceRegistry` conserva metadata, vigencias y aprobación trazables

`NormativeSourceRegistry` conserva organismo, documento/URL, fecha de consulta, vigencias,
hash, reviewer fiscal, aprobación, supersession, alertas y fixtures.

### CAD-156-02 — Todos los artefactos fiscales referencian source version explícita

QR, tax, layouts, voucher codes y reglas fiscales referencian una versión normativa
explícita; fuentes unsupported o expired bloquean emisión segura.

### CAD-156-03 — La validación cubre pre/post issue y export/libro con trazabilidad

la validación pre/post issue cubre campos, ecuaciones, numbering, autorización, notas y
export/libro fiscal con trazabilidad de regla y evidencia.

### CAD-156-04 — Cada finding conserva `ruleVersion`, `sourceVersion` y evidencia redactada

cada finding conserva `ruleVersion`, `sourceVersion` y evidencia redactada suficiente para
auditoría.

### CAD-156-05 — Ningún override operativo puede fabricar autorización ni saltar bloqueos críticos

ningún override operativo puede fabricar autorización fiscal ni saltar bloqueos normativos
críticos.

### CAD-156-06 — La aprobación exige evidencia de registry, expiración, findings y runbook vigente

La aprobación exige fixtures de registry, expiración, findings, bloqueos críticos,
homologación y runbook vigente.
