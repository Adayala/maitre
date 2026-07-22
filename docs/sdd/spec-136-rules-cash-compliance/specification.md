# Especificación — SPEC-136 Cash Compliance Rules

PolicyVersion registra owner, fuente/provenance, vigencia, thresholds, moneda, reviewer y fixtures.
El evaluador produce findings explicables con rule/version, evidence window, confidence y access
classification; no modifica ledger ni bloquea automáticamente fuera de reglas aprobadas.

Fraccionamiento, diferencias repetidas o autoaprobación son señales, no prueba de fraude. Findings
requieren revisión humana, acceso restringido, resolución/appeal y retención definida. Sin policy
aplicable devuelve `NOT_CONFIGURED` y deniega sólo operaciones cuyo límite sea obligatorio.
