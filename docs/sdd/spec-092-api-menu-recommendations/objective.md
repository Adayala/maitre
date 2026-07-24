# Objetivo — SPEC-092

Definir la API de recomendaciones de menú como ranking explicable, sensible a disponibilidad y
privacy-safe por default.

## Criterios de aceptación

### CAD-092-01 — Inputs, outputs, ranking y fallback quedan definidos con claridad

inputs permitidos, outputs, ranking y fallback determinista quedan definidos con claridad.

### CAD-092-02 — Sólo se recomiendan items disponibles y publicados autorizados

la API recomienda sólo items disponibles y publicados dentro de una MenuRevision
autorizada.

### CAD-092-03 — Las señales sensibles se procesan efímeramente por default

restricciones y señales sensibles se procesan efímeramente por default y no crean perfiles
implícitos.

### CAD-092-04 — Cada resultado expone score, rank y versionado explicable

cada resultado expone score/rank, reason codes y versionado de policy/model.

### CAD-092-05 — El contrato niega garantías médicas e inferencias diagnósticas

el contrato niega garantías médicas o de contaminación cruzada y evita inferencias
diagnósticas.

### CAD-092-06 — La aprobación exige evidencia de ranking, privacidad y degradación segura

La aprobación exige fixtures de catálogo vacío, incompatibilidades, ranking estable,
privacidad y degradación segura.
