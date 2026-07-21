# Contrato API — SPEC-058 Checks

Crear/obtener Check y ejecutar request-payment, void o recalculate controlado. Creación por
Visit/revisión es idempotente y captura snapshots; no recibe totales autoritativos del
cliente. Mutaciones usan If-Match y permisos. `409` cubre check activo duplicado, `412`
versión y `422` órdenes/transición inconsistentes. Respuesta separa total/saldo y nunca
incluye datos de tarjeta. Tests cubren rounding, retry, closed visit y auditoría.
