# Contrato transversal — SPEC-218 Offline Sync

Clientes offline guardan comandos idempotentes con identidad, versión base, timestamp y estado,
nunca secretos persistentes. Sync revalida autorización y reglas en servidor; conflictos usan
política explícita por agregado, no last-write-wins universal. Tests cubren reconexión, orden,
duplicados, sesión revocada, clock skew, schema upgrade, storage quota, privacidad y UX de
conflicto.
