# Especificación — SPEC-136 Cash Compliance Rules

PolicyVersion registra owner, fuente/provenance, vigencia, thresholds, moneda, reviewer y fixtures.
El evaluador produce findings explicables con rule/version, evidence window, confidence y access
classification; no modifica ledger ni bloquea automáticamente fuera de reglas aprobadas.

Fraccionamiento, diferencias repetidas o autoaprobación son señales, no prueba de fraude. Findings
requieren revisión humana, acceso restringido, resolución/appeal y retención definida. Sin policy
aplicable devuelve `NOT_CONFIGURED` y deniega sólo operaciones cuyo límite sea obligatorio.

PolicyVersion conserva `owner`, `source`, `provenance`, `effectiveFrom`, `effectiveTo?`,
`thresholds`, `currency`, `reviewer`, `approval`, `fixtures` y supersession cuando exista. Cada
policy debe poder reconstruirse y justificarse frente a auditoría posterior.

El evaluador opera sobre sesiones, movimientos, reconciliaciones, descuentos y excepciones
documentadas. Produce findings `INFO | WARNING | BLOCKING` con `ruleId`, `ruleVersion`,
`evidenceWindow`, `confidence`, `accessClassification` y evidence linkage. No borra ledger, no
reclasifica movimientos automáticamente ni decide por sí solo un caso de fraude o sanción.
