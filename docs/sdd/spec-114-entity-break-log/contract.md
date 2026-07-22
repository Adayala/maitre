# Contrato de entidad — SPEC-114 Break Log

BreakLog registra inicio y fin de una pausa asociada a una TimeEntry, con tipo, remuneración,
fuente y estado OPEN/CLOSED. No admite pausas simultáneas ni intervalos fuera de la jornada; las
correcciones son BreakAdjustment append-only y preservan evidencia, actor y motivo. Tests cubren
pausas abiertas al clock-out, límites, DST, concurrencia, clasificación remunerada, ajustes,
auditoría y aislamiento entre tenants.
