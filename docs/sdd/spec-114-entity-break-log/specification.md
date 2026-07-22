# Especificación — SPEC-114 BreakLog

BreakLog pertenece a TimeEntry y congela type, paid classification y policy version. Lifecycle
`OPEN -> CLOSED`; no permite dos pausas abiertas ni intervalos fuera de la jornada efectiva.

Clock-out con pausa abierta se rechaza o auto-cierra sólo si la policy version lo dispone, dejando
finding y reason explícitos. Correcciones usan BreakAdjustment append-only y recomputan
proyecciones; nunca editan timestamps originales.
