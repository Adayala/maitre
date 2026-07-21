# Contrato API — SPEC-056 Occupancy

Commands `/v1/visits/{id}/occupancies` asignan, mueven y liberan mesas atómicamente. No
aceptan status derivado. Cada command usa idempotency key y expected versions de Visit/Table
projection. Mover varias mesas es todo-o-nada; conflicto devuelve `409/412` con Problem
Details sin revelar otra visita. Lectura expone historia sólo a roles autorizados. Tests
cubren overlap, partial move rollback, duplicate command, scope y auditoría.
