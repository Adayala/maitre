# Especificación — SPEC-200 Insights API

Insight versionado refiere metrics/events de evidencia autorizados, rule/model, confidence, freshness,
limitations y suggested `ActionRegistry` ID. Fingerprint/cooldown deduplica contradicciones.

Lifecycle OPEN/ACKNOWLEDGED/RESOLVED/DISMISSED con feedback/reason. Desactualizado, contradictorio o de baja
confidence queda WITHHELD y no activa automation. Citas son refs internas autorizadas, no texto libre
inyectable. Leer insight no confiere acceso a evidence restringida.

`GET /insights` lista insights visibles por actor/alcance; `GET /insights/{insightId}` devuelve detalle
sanitizado; `POST /insights/{insightId}:acknowledge|resolve|dismiss` gobierna lifecycle. La
generación de insights puede ser asíncrona o batch, pero la API de lectura siempre debe exponer
confidence, freshness, limitations y estado de withholding.

La capa de insight es interpretativa, no autoritativa sobre evidencia. Cualquier drill-down a métrica
o evento subyacente exige el permiso original sobre esa evidencia, aunque el actor pueda ver el
insight resumido.
