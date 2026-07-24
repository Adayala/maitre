# Especificación — SPEC-113 TimeEntry

TimeEntry refiere Employment, Branch y assignment opcional. Conserva `capturedAt`, `receivedAt`,
timezone, source, device pseudonymous ID, device sequence y clock skew. Sólo una entrada OPEN por
Employment/tenant.

El ciclo de vida es `OPEN -> CLOSED`; una anomalía queda `PENDING_REVIEW` como flag/workflow, no reemplaza la
marca original. Correcciones crean TimeAdjustment encadenado con before/after, reason, evidence,
requester, approver y effectiveAt; `ADJUSTED` no muta ni oculta el registro fuente.

TimeEntry referencia `employmentId`, `branchId` y `shiftAssignmentId?`. Conserva `capturedAt`,
`receivedAt`, timezone IANA, source, device pseudonymous ID, device sequence y estimación de skew
para auditoría y reconciliación. La existencia de shift es opcional salvo policy explícita; trabajar
sin shift puede ser permitido, bloqueado o marcado para revisión según branch/policy.

Sólo existe una TimeEntry `OPEN` por `employmentId/tenantId` al mismo tiempo. `PENDING_REVIEW` no
reemplaza el lifecycle principal sino que añade una bandera o workflow de revisión sobre la marca
original. Cerrar una entrada sin coherencia temporal o policy válida falla cerrado o dispara review
según la regla aprobada.
