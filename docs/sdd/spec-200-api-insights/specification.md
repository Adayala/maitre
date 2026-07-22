# Especificación — SPEC-200 Insights API

Insight versionado refiere evidence metrics/events autorizados, rule/model, confidence, freshness,
limitations y suggested ActionRegistry ID. Fingerprint/cooldown deduplica contradicciones.

Lifecycle OPEN/ACKNOWLEDGED/RESOLVED/DISMISSED con feedback/reason. Stale, contradictorio o baja
confidence queda WITHHELD y no activa automation. Citas son refs internas autorizadas, no texto libre
inyectable. Leer insight no confiere acceso a evidence restringida.
