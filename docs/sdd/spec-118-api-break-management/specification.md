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

CAD-118-05 queda congelado así: el acceso propio sólo puede consultar el `TimeEntry` propio y sus
`BreakLog`/`BreakAdjustment` asociados; no puede usar listados supervisorios por sucursal ni leer
pausas/correcciones de otros empleos aunque comparta sucursal. En acceso propio, la representación de
`BreakAdjustment` omite `requesterId`, `approverId` y `evidence`, y no expone metadatos que revelen
autoridad de terceros. Supervisor access requiere permiso sensible más scope válido de sucursal y/o
Employment; dentro de ese scope puede usar los listados por sucursal, por `TimeEntry` y por
`BreakLog`, y recibe la representación completa necesaria para auditoría.
