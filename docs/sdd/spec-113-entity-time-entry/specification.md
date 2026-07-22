# Especificación — SPEC-113 TimeEntry

TimeEntry refiere Employment, Branch y assignment opcional. Conserva `capturedAt`, `receivedAt`,
timezone, source, device pseudonymous ID, device sequence y clock skew. Sólo una entrada OPEN por
Employment/tenant.

Lifecycle `OPEN -> CLOSED`; una anomalía queda `PENDING_REVIEW` como flag/workflow, no reemplaza la
marca original. Correcciones crean TimeAdjustment encadenado con before/after, reason, evidence,
requester, approver y effectiveAt; `ADJUSTED` no muta ni oculta el registro fuente.
