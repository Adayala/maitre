# Especificación — SPEC-062 VisitClosed

`floor.visit.closed.v1` sólo cuando Visit pasa CLOSING→CLOSED después de validar Check/payments y
cerrar Occupancies en la misma transacción. Incluye envelope, visit/branch, closedAt, outcome,
check revision y aggregate revision; omite importes/PII. Reopen correctivo emite otro evento, no
borra este hecho.
