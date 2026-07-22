# Contrato — SPEC-054 ServicePeriod

ServicePeriod representa una jornada operativa de restaurante dentro de Branch, no un item
de suscripción. Campos: businessDate según timezone de Branch, name/type, planned window,
actual open/close, status `PLANNED | OPEN | CLOSING | CLOSED`, version y actor. Una
ServicePeriodPolicyVersion gobierna solapamiento; default no permite OPEN/CLOSING simultáneos.
Cierre bloquea nuevas Visits y espera/reporta
operaciones pendientes. Business date nunca usa UTC por defecto. Tests cubren DST,
concurrencia de apertura/cierre, pendientes y tenant scope.
