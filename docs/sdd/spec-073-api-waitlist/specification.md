# Especificación — SPEC-073 Waitlist API

Add/list/get y comandos `notify`, `seat`, `cancel`, `expire` bajo Branch. Add es idempotente por
canal/request. List usa cursor y el orden calculado por la policy versionada de SPEC-068.

`notify` sólo crea una intención de comunicación: no reserva capacidad. `seat` adquiere un
CapacityHold, revalida compatibilidad y crea/vincula Visit en la misma transacción; reintentos
devuelven la Visit ya vinculada. Overrides de prioridad requieren permiso, reason code y audit.

Los estados terminales no vuelven a `WAITING`. Contacto y notas se minimizan y redactan en listas.
