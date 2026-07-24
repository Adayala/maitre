# Especificación — SPEC-117

Comandos `clock-in`, `clock-out`, `request-adjustment`, `approve-adjustment`, `reject-adjustment`.
Offline clock incluye command ID, device ID seudónimo, monotonic sequence, capturedAt, timezone y
firma/session proof. El servidor fija receivedAt, detecta replay y calcula skew.

Fuera de tolerancia, secuencia rota, Employment dudoso o conflicto deja la marca
`PENDING_REVIEW`; no descarta evidencia ni confía automáticamente en device time. Requester no
aprueba su ajuste. Períodos exportados reciben ajuste retroactivo, nunca reescritura.

La superficie incluye comandos explícitos `clock-in`, `clock-out`, `request-adjustment`,
`approve-adjustment` y `reject-adjustment`. No existe edición directa de TimeEntry ni sobrescritura
de marcas originales. Las respuestas declaran metadata suficiente para auditoría, review y correlación
sin exponer datos de terceros innecesarios.

El protocolo offline debe soportar reintentos idempotentes y recepción desordenada de comandos del
dispositivo. El servidor fija `receivedAt`, valida secuencia monotónica, detecta replay y calcula
skew respecto de `capturedAt`. Si una marca parece sospechosa, la evidencia se conserva y el flujo
de review la trata explícitamente.
