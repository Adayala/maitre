# Objetivo — SPEC-200

Definir la API de insights como capa versionada y gobernada sobre evidencia autorizada, sin otorgar
acceso indirecto a datos restringidos.

## Criterios de aceptación

### CAD-200-01 — Insight versionado refiere evidencia autorizada, confidence, freshness y acción sugerida

Insight versionado refiere métricas/eventos autorizados como evidencia, rule/model, confidence,
freshness, limitations y suggested `ActionRegistry` ID.

### CAD-200-02 — Fingerprint y cooldown deduplican contradicciones o repeticiones

Fingerprint y cooldown deduplican contradicciones o repeticiones.

### CAD-200-03 — El ciclo de vida define open, acknowledged, resolved y dismissed

El ciclo de vida es `OPEN|ACKNOWLEDGED|RESOLVED|DISMISSED` con feedback/reason.

### CAD-200-04 — Desactualización, contradicción o baja confidence dejan el insight `WITHHELD`

Un insight desactualizado, contradictorio o de baja confidence queda `WITHHELD` y no activa automation.

### CAD-200-05 — Citas son refs internas autorizadas y leer un insight no hereda acceso

Citas son refs internas autorizadas, no texto libre inyectable; leer un insight no confiere acceso a
evidence restringida.

### CAD-200-06 — La aprobación exige evidencia de dedupe, withheld, citations y aislamiento

La aprobación exige fixtures de dedupe/cooldown, withheld, authorized citations, ciclo de vida y
aislamiento de permisos sobre evidencia.
