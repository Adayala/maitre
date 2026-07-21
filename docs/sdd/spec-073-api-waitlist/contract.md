# Contrato API — SPEC-073 Waitlist

Rutas por Branch para add/list/get y commands notify/seat/cancel/expire. Add es idempotente
por canal/request; lista usa orden/priority autoritativos y cursor. Notify no reserva mesa;
seat revalida capacidad y crea/vincula Visit atómicamente. Datos de contacto se minimizan.
Tests cubren concurrencia de seating, orden, expiry, duplicate notification, scope y audit.
