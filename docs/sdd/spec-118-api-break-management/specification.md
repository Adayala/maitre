# Especificación — SPEC-118 Break Management API

Commands `start`, `end`, `request-adjustment`, `approve-adjustment`, con el mismo protocolo offline
de SPEC-117. Start exige TimeEntry OPEN y ausencia de pausa abierta; end refiere break ID/revision.

La policy clasifica y genera findings, pero no inventa timestamps. Correcciones son append-only y
segregan requester/approver. Acceso propio omite datos de terceros; management requiere permiso
sensible y alcance de sucursal/Employment.

El surface incluye comandos explícitos `start`, `end`, `request-adjustment` y
`approve-adjustment`/`reject-adjustment` cuando aplique. `start` exige TimeEntry `OPEN`, ausencia de
otra pausa abierta y policy laboral vigente. `end` refiere `breakId` y revisión esperada para evitar
cierres perdidos o sobrepuestos.

El protocolo offline reutiliza los principios de SPEC-117: command ID, device pseudonymous ID,
capturedAt, timezone, secuencia y evidencia. La policy puede clasificar o generar findings, pero no
inventar timestamps no capturados ni ocultar incumplimientos. Las correcciones posteriores se
expresan como ajustes append-only auditados.
