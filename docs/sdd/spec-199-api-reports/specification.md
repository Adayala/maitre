# Especificación — SPEC-199 Reports API

Job versionado por period/branch/timezone/format/report definition. Manifest conserva params,
metric/data revisions, freshness, suppression, counts, hash, errors y generatedAt.

Range/row/cost/retention limits son obligatorios. Signed download expira y se audita; CSV neutraliza
formula injection. Reintento idempotente no duplica artifacts. Report respeta permisos al generar y
al descargar.
