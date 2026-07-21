# Contrato — SPEC-050 Occupancy

Occupancy representa la asignación temporal de una Table a Visit, con `startedAt`, `endedAt`,
guest allocation, status y versión. Es la fuente para ocupación; no se deduce sólo de un
flag en Table. Intervalos activos no se solapan por mesa. Abrir/cerrar/mover se realiza
atómicamente y conserva historia. Una ocupación cerrada no se reabre. Tests cubren doble
seating concurrente, move multi-table, cierre parcial, reloj inyectado y tenant isolation.
