# Contrato API — SPEC-104 Production

Consultar colas por estación y ejecutar claim/start/hold/resume/ready sobre unidades de
producción. En I0 la proyección expone sólo `stationId`, `commands` y `asOf`, con orden
determinista por `priority`, `receivedAt` e `id`. Los comandos usan endpoints explícitos
(`claim`, `release`, `start`, `hold`, `resume`, `mark-ready`, `complete-handoff`, `rollback`,
`cancel`, `transfer`, `reprioritize`) y rechazan saltos inválidos de estado. I0 no implementa
cursor/freshness ni `If-Match`/idempotencia versionada en headers. Tests cubren múltiples
operadores, prioridades, hold/resume, lifecycle, RBAC y aislamiento entre sucursales.
