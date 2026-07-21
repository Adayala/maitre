# Contrato API — SPEC-104 Production

Consultar colas por estación y ejecutar claim/start/hold/resume/ready sobre unidades de
producción. La proyección declara cursor y freshness, mantiene orden determinista por
prioridad y antigüedad, y no acepta saltos inválidos de estado. Los comandos son idempotentes
y versionados. Tests cubren eventos tardíos o duplicados, múltiples operadores, prioridades,
reanudación, degradación de la proyección, RBAC y aislamiento entre sucursales.
