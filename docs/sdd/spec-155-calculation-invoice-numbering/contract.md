# Contrato de cálculo — SPEC-155 Invoice Numbering

Reservar y reconciliar numeración monotónica por entidad fiscal, punto de venta y tipo de
comprobante, coordinada con el último autorizado por ARCA. Una intención mantiene número e
idempotency key ante reintentos; un timeout nunca consume otro número a ciegas. Tests cubren
alta concurrencia, gaps documentados, rollback, divergencia remota, reinicio, notas asociadas,
límites de formato y recuperación determinista.
