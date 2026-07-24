# Especificación — SPEC-119

Nombre normativo `workforce.work-shift.started.v1`. Se emite sólo por command que cambia `WorkShift`
de PUBLISHED a IN_PROGRESS; no representa primer clock-in ni hora planificada.

Envelope SPEC-217 + `workShiftId`, sucursal, intervalo planificado, `startedAt`, policy/revisión y tipo de actor.
No incluye fichadas, Employee IDs ni remuneración. Agregados de dotación sólo se publican si
alcanzan el umbral de privacidad configurado.
