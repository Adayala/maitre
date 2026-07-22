# Especificación — SPEC-056 Occupancy API

List/detail historial y commands seat/move/release sobre Visit. Mutations son atómicas y bloquean
Tables en orden estable; expected revisions cubren Visit y Occupancies. No acepta intervalos ni
tenant/branch del cliente.

Conflicto de mesa activa devuelve `409` con reason no sensible. Reintento devuelve resultado previo.
Cerrar parcial revalida capacity; TableStatus se actualiza por outbox/proyección.
