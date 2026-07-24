# Especificación — SPEC-114 BreakLog

BreakLog pertenece a TimeEntry y congela type, paid classification y policy version. Lifecycle
`OPEN -> CLOSED`; no permite dos pausas abiertas ni intervalos fuera de la jornada efectiva.

Clock-out con pausa abierta se rechaza o auto-cierra sólo si la policy version lo dispone, dejando
finding y reason explícitos. Correcciones usan BreakAdjustment append-only y recomputan
proyecciones; nunca editan timestamps originales.

BreakLog referencia una única `timeEntryId` y conserva `breakType`, `paidClassification`,
`laborPolicyVersion`, `openedAt`, `closedAt?`, source y metadata de auditoría. No admite dos pausas
abiertas simultáneas dentro de la misma TimeEntry ni intervalos que excedan la jornada efectiva
salvo policy explícita de excepción.

El comportamiento ante `clock-out` con pausa abierta depende de la `laborPolicyVersion`: puede
rechazar el cierre o autocerrar la pausa con finding y `reasonCode` explícitos. En ambos casos la
decisión debe ser auditable y reproducible. BreakAdjustment agrega correcciones append-only con
before/after, actor, motivo y evidencia sin mutar los timestamps fuente.
