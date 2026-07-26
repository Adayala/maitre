# Especificación — SPEC-069 ReservationPreference

I0 actual separa `PREFERENCE` best-effort de `REQUIREMENT` operativo mediante un registro simple.
El subject puede ser `GUEST` como default reutilizable o `RESERVATION` como override puntual.
Cada record conserva `code`, `value` opcional, `notes` opcional y revisión simple.

No existe todavía catálogo tipado de códigos/valores, pipeline de sanitización, consent proof,
visibility/retention policy ni versionado histórico. La distinción normativa vigente es:

- `PREFERENCE`: expresa una preferencia deseada y nunca bloquea por sí sola.
- `REQUIREMENT`: expresa una condición operativa que los callers pueden tratar como bloqueante.

El agregado Reservation no congela snapshots de preferences en este I0. La evaluación de
requirements no satisfechos queda delegada a callers/flows posteriores; esta spec sólo exige la
persistencia consistente del dato y la semántica de `kind`.
