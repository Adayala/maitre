# Especificación — SPEC-112 ShiftAssignment y autoridad de Employment

`Employment` es la autoridad laboral mínima, separada de User/Membership: tenant, person reference,
employee code, relationship type, validity interval, eligible branches, capabilities laborales y
status. Autenticación no demuestra empleo; un contratista puede tener Employment sin User.

ShiftAssignment vincula WorkShift con Employment vigente, branch elegible, función y station
opcional. Lifecycle `PROPOSED -> CONFIRMED | DECLINED | CANCELLED`. Unicidad por shift/employment;
conflictos se evalúan contra policy version. Revocar Membership corta acceso, no borra empleo;
terminar Employment impide nuevas asignaciones/fichadas y preserva historia.
