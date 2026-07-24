# Objetivo — SPEC-190

Definir Alert y AlertRule como activaciones versionadas, con cooldown, dedupe y tratamiento explícito
de datos insuficientes.

## Criterios de aceptación

### CAD-190-01 — `AlertRule` versiona condición, evidencia, severidad, owner y recipients

`AlertRule` versionada define metric, condition, evidence window, severity, owner, runbook, cooldown,
suppression y recipients.

### CAD-190-02 — El fingerprint combina tenant, rule, subject y window

Activation fingerprint = tenant + rule + subject + window.

### CAD-190-03 — El lifecycle define apertura, resolución, dismiss y nueva activación

Lifecycle es `OPEN -> ACKNOWLEDGED -> RESOLVED | DISMISSED`; nueva condición tras `RESOLVED` crea una
activación nueva.

### CAD-190-04 — Snooze no resuelve y datos stale o insuficientes producen `UNKNOWN`

Snooze no resuelve; datos stale o insuficientes producen `UNKNOWN` y no notifican ni automatizan.

### CAD-190-05 — Dedupe y cooldown agregan occurrences y evitan fatiga

Dedupe y cooldown agregan occurrences y evitan fatiga conservando evidencia.

### CAD-190-06 — La aprobación exige evidencia de fingerprint, cooldown, snooze, unknown y dedupe

La aprobación exige fixtures de fingerprint, cooldown, snooze, unknown, dedupe y nueva activación tras
resolved.
