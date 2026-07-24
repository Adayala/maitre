# Objetivo — SPEC-157

Definir Feedback como caso trazable y orientado a privacidad que separa contenido, sujetos, identidad opcional
y ciclo de vida operativo sin perder provenance ni base de tratamiento.

## Criterios de aceptación

### CAD-157-01 — Feedback separa contenido, sujetos e identidad opcional con metadata de tratamiento

feedback separa contenido, subject refs e identidad/contacto opcional cifrado con metadata
explícita de purpose, treatment basis/consent, retention class y visibility.

### CAD-157-02 — El ciclo de vida del caso sigue un flujo explícito con reapertura controlada

el ciclo de vida del caso sigue `OPEN -> TRIAGED -> ACTION_REQUIRED | NO_ACTION -> RESOLVED`,
con `REOPEN` controlado por reason.

### CAD-157-03 — `REDACTED` modela estado del contenido sin reemplazar resolución del caso

`REDACTED` modela estado del contenido y no sustituye el cierre/resolución del caso.

### CAD-157-04 — Assign, resolve, reopen y redact exigen revisión, causalidad y auditoría

assign, resolve, reopen y redact requieren expected revision, causalidad y auditoría
completa.

### CAD-157-05 — La redacción preserva hash y provenance sin afirmar borrado remoto

la redacción preserva hash, provenance y evidencia de transformación sin afirmar borrado
remoto en plataformas externas.

### CAD-157-06 — La aprobación exige evidencia de ciclo de vida, privacidad y retención

La aprobación exige fixtures de ciclo de vida, revisiones, redacción, privacidad, retención y
reapertura.
