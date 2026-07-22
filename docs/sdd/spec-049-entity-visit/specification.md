# Especificación — SPEC-049 Visit

Visit es la autoridad de sesión operativa desde seating. Lifecycle autoritativo:

- `OPEN`: acepta órdenes y cambios de mesas.
- `CLOSING`: check solicitado; no acepta nuevas órdenes salvo override auditado.
- `CLOSED`: occupancies cerradas y Check SETTLED/VOID; terminal.
- `CANCELLED`: sólo antes de consumo/Check, con reason; terminal.

Waiting pertenece a Reservation/Waitlist y no a Visit. `SEATED`, `IN_SERVICE`, `PAYING` son estados
derivados para UI desde Occupancy, Order/Kitchen y Check, no writes independientes. `request-close`
cambia OPEN→CLOSING; `close` valida saldo, pagos pending, kitchen y occupancies y escribe outbox en
la transacción. Reopen requiere workflow correctivo manager, nueva revisión y audit.
