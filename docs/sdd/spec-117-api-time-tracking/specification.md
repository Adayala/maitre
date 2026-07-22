# Especificación — SPEC-117 Time Tracking API

Commands `clock-in`, `clock-out`, `request-adjustment`, `approve-adjustment`, `reject-adjustment`.
Offline clock incluye command ID, device ID seudónimo, monotonic sequence, capturedAt, timezone y
firma/session proof. El servidor fija receivedAt, detecta replay y calcula skew.

Fuera de tolerancia, secuencia rota, Employment dudoso o conflicto deja la marca
`PENDING_REVIEW`; no descarta evidencia ni confía automáticamente en device time. Requester no
aprueba su ajuste. Períodos exportados reciben ajuste retroactivo, nunca reescritura.
