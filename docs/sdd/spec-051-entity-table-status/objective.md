# Objetivo — SPEC-051

## Propósito

TableStatus ofrece una lectura derivada, explicable y temporal del uso de una Table, sin
convertirse en autoridad ni aceptar escrituras directas.

## Resultado esperado

### CAD-051-01 — La proyección expone contexto completo y explicable del estado de mesa

Cada resultado incluye Table, status, reason, recurso relacionado, revisiones fuente y
`asOf`.

### CAD-051-02 — La precedencia de señales es versionada y determinista

Una precedencia versionada resuelve señales simultáneas de forma determinista.

### CAD-051-03 — Occupancy activa domina la ocupación visible de la mesa

Occupancy ACTIVE determina `OCCUPIED` o `PAYING` y prevalece sobre Reservation.

### CAD-051-04 — Señales stale o desordenadas no degradan la revisión autoritativa

Eventos obsoletos o desordenados no degradan la revisión y la falta de frescura queda
visible.

### CAD-051-05 — Ninguna mutación toma la proyección como autoridad

Ninguna mutación confía en la proyección; siempre revalida fuentes autoritativas.

### CAD-051-06 — La aprobación exige evidencia de precedencia, convergencia y aislamiento

La aprobación exige fixtures de precedencia, ventanas temporales, convergencia,
aislamiento y ausencia de writes directos.
