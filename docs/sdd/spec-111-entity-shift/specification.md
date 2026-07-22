# Especificación — SPEC-111 WorkShift

El nombre normativo es `WorkShift`; `Shift` queda como alias de compatibilidad. Es una ventana
laboral planificada por Branch y no se infiere de ServicePeriod.

Lifecycle: `DRAFT -> PUBLISHED -> IN_PROGRESS -> COMPLETED`; `DRAFT|PUBLISHED -> CANCELLED`.
Publicar congela revision, timezone IANA, intervalos UTC, roles/capabilities requeridos, capacity y
LaborPolicyVersion. Cambios posteriores crean revisión y revalidan assignments; no reescriben la
versión publicada. El vínculo opcional a ServicePeriod es por ID explícito.
