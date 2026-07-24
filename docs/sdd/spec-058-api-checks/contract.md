# Contrato API — SPEC-058 Checks

Crear/obtener Check y ejecutar add-adjustment, request-payment, settle o void. Creación por
Visit/revisión es idempotente y captura snapshots; la recomputación ocurre dentro de esos
workflows y no es un endpoint público arbitrario. El cliente no aporta totales
autoritativos. Mutaciones usan `Idempotency-Key`, `If-Match` y permisos. `409` cubre Check
duplicado/conflictos, `412` versión y `422` fuentes o transición inconsistentes. La respuesta
separa total/saldo y nunca incluye datos de tarjeta. Tests cubren redondeo, retry,
concurrencia, Visit cerrada y auditoría.
