# Contrato API — SPEC-060 Services

API para planificar/listar y abrir/cerrar Service por Branch/businessDate. Open/close son
commands idempotentes con If-Match y actor autorizado; timezone proviene de Branch. Cierre
con Visits/Checks pendientes devuelve `422` con reason codes o inicia estado CLOSING según
política. No cambia payroll ni subscription. Tests cubren DST, doble apertura, close race,
scope, recuperación y auditoría.
