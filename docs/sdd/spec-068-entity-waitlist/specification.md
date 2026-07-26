# Especificación — SPEC-068 WaitlistEntry

Lifecycle `WAITING -> NOTIFIED -> SEATED`; `WAITING` y `NOTIFIED` también pueden pasar a
`CANCELLED` o `EXPIRED`. Notify no crea hold. En este I0 `seat` sólo enlaza una `Visit` ya abierta
por el route layer; no existe `CapacityAllocation` materializada.

El orden I0 se resuelve por `priorityOverride` entero descendente, luego `arrivedAt` ascendente y
finalmente `id` como desempate estable. No existen `OrderingPolicyVersion`, bands, aging anti-
starvation ni expiry del override.

`priorityOverride` se aplica manualmente y conserva `overrideReason` textual simple. Cambiar la
prioridad no modifica `arrivedAt`. `quotedMinutes`, `guestId` y `notes` son opcionales.
