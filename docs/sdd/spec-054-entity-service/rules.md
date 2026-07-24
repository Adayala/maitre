# Rules — SPEC-054

- El nombre normativo es ServicePeriod; “Service” sólo puede ser una etiqueta de UI no
  ambigua.
- BusinessDate se deriva con timezone IANA de Branch y no con UTC por defecto.
- Tipo pertenece al catálogo versionado `BREAKFAST | LUNCH | DINNER | OTHER`.
- La política versionada gobierna ventanas y solapamiento; el default excluye más de un
  OPEN/CLOSING por Branch.
- Open y begin-close usan revisión e idempotencia y serializan conflictos por Branch.
- CLOSING rechaza nuevas Visits y expone operaciones pendientes.
- Un timeout no fuerza CLOSED: conserva CLOSING y escala.
- Force-close requiere manager, reason y findings; no modifica Visit, Check, Payment ni
  CashSession para simular su cierre.
- CLOSED y CANCELLED son terminales; una corrección conserva historia.
