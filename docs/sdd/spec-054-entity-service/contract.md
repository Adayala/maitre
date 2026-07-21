# Contrato — SPEC-054 Service

Service representa una jornada/turno operativo de restaurante dentro de Branch, no un item
de suscripción. Campos: businessDate según timezone de Branch, name/type, planned window,
actual open/close, status `PLANNED | OPEN | CLOSING | CLOSED`, version y actor. Sólo uno o
los definidos por política pueden solaparse. Cierre bloquea nuevas Visits y espera/reporta
operaciones pendientes. Business date nunca usa UTC por defecto. Tests cubren DST,
concurrencia de apertura/cierre, pendientes y tenant scope.
