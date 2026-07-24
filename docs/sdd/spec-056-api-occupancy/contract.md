# Contrato API — SPEC-056 Occupancy

Commands bajo `/v1/visits/{visitId}/occupancies` asignan, mueven y liberan mesas
atómicamente. No aceptan status ni intervalos derivados. Cada command usa
`Idempotency-Key`, `If-Match` para Visit y revisiones esperadas de Occupancy/Table config
cuando corresponda. Mover varias mesas es todo-o-nada; conflicto devuelve `409/412` con Problem
Details sin revelar otra visita. Lectura expone historia sólo a roles autorizados. Tests
cubren overlap, rollback de move parcial, comando duplicado, capacidad, scope y auditoría.
