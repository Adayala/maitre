# Objetivo — SPEC-057

Exponer TableStatus como proyección operacional legible, versionada, privada y no
autoritativa, con degradación explícita cuando sus fuentes no están frescas.

## Criterios de aceptación

### CAD-057-01 — La proyección expone únicamente lecturas aprobadas por Branch y Table

Sólo existen GET de colección por Branch y detalle por Table.

### CAD-057-02 — Cada representación conserva explicabilidad, revisión y frescura

Cada representación incluye status, reason, referencia redactada, revisiones fuente,
`asOf` y freshness.

### CAD-057-03 — Paginación y conditional GET mantienen orden y scope estables

Filtros, cursor, conditional GET y límites preservan orden y scope estables.

### CAD-057-04 — El lag o las dependencias parciales nunca fabrican disponibilidad

lag, gaps y dependencias parciales se declaran y nunca se convierten en AVAILABLE por
defecto.

### CAD-057-05 — La proyección no expone PII ni se usa como superficie de escritura

No se expone PII ni existe comando de escritura; toda acción deriva a una API autoritativa
que revalida fuentes.

### CAD-057-06 — La aprobación exige evidencia de precedencia, fallback y privacidad

La aprobación exige fixtures de precedencia, DST, eventos desordenados, refetch, polling,
privacidad y aislamiento.
