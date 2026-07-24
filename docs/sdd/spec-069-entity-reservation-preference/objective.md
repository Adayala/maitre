# Objetivo — SPEC-069

## Propósito

ReservationPreference modela señales tipadas de preferencia o requerimiento para una Guest
o Reservation, con tratamiento de datos y vigencia explícitos.

## Resultado esperado

### CAD-069-01 — Cada preferencia declara subject, tipado y tratamiento explícitos

Cada registro posee tenant, subject Guest/Reservation, kind, code/value tipados, priority,
source, purpose, basis y vigencia.

### CAD-069-02 — Reservation congela el snapshot de preferencias aplicables

Una Reservation congela las preferencias/requerimientos aplicables y sus revisiones al
confirmar.

### CAD-069-03 — Requirements sólo bloquean mediante reglas operativas versionadas

PREFERENCE es best-effort; REQUIREMENT no satisfecho bloquea únicamente mediante regla
operativa/versionada y reason explícito.

### CAD-069-04 — Precedencia, expiración y conflicto son reproducibles

precedencia, expiración y conflictos son deterministas y explicables.

### CAD-069-05 — Los datos sensibles tienen reglas específicas de acceso y retención

accesibilidad/dietary/allergen tienen acceso, redacción, retention y export/anonymize
específicos; texto libre no sustituye códigos de seguridad.

### CAD-069-06 — La aprobación exige evidencia de snapshots, privacidad y aislamiento

La aprobación exige fixtures de validación, snapshots, precedencia, privacidad, eliminación
y aislamiento.
