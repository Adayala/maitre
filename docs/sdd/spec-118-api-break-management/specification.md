# Especificación — SPEC-118 Break Management API

Commands `start`, `end`, `request-adjustment`, `approve-adjustment`, con el mismo protocolo offline
de SPEC-117. Start exige TimeEntry OPEN y ausencia de pausa abierta; end refiere break ID/revision.

La policy clasifica y genera findings, pero no inventa timestamps. Correcciones son append-only y
segregan requester/approver. Acceso propio omite datos de terceros; management requiere permiso
sensible y branch/employment scope.
