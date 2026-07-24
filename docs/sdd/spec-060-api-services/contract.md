# Contrato API — SPEC-060 ServicePeriods

API para planificar/listar y abrir/cerrar ServicePeriod por Branch/businessDate. Create
recibe tipo y ventana local; timezone y businessDate efectivo se derivan de Branch/política.
Open/close son comandos idempotentes con `If-Match` y actor autorizado. Cierre con
Visits/Checks/Payments/CashSessions pendientes devuelve `422` con reason codes o permanece
CLOSING según política. No cambia dependencias, payroll ni subscription. Tests cubren DST,
doble apertura, close race, scope, recuperación y auditoría.
