# Operación de Maitre

Este directorio reúne el estado operativo real del MVP, los runbooks y las decisiones que
complementan las especificaciones normativas. Una capacidad sólo se considera operativa cuando el
documento correspondiente identifica implementación, evidencia y límites vigentes.

## Estado consolidado

- [Cierre de gaps del MVP — 30 de julio de 2026](mvp-gap-closure-2026-07-30.md)
- [Perfil de runtime durable](durable-runtime-profile.md)
- [Auditoría de mutaciones sensibles](audit-runbook.md)
- [Observabilidad operativa](observability-runbook.md)
- [Despliegue en Vercel](../../DEPLOYMENT.md)
- [ADR-005 — backend de telemetría del MVP Demo](../adr/ADR-005-mvp-demo-telemetry-backend.md)

## Semántica de estado

| Estado | Significado |
| --- | --- |
| `IMPLEMENTED` | Existe código integrado y pruebas automatizadas. |
| `OPERATIONAL_LOCAL` | La señal funciona localmente y en tests, sin backend remoto durable. |
| `OPERATIONAL_CI` | La capacidad es un gate obligatorio y reproducible de GitHub Actions. |
| `AVAILABLE_NOT_CONFIGURED` | Existe un adapter activable, pero el ambiente actual no lo configura. |
| `NOT_OPERATIONAL` | No debe presentarse como capacidad activa ni usarse para aprobar releases. |

La metadata de cada SPEC conserva su lifecycle de aprobación. Que un corte esté implementado no
convierte automáticamente una SPEC `DRAFT` en `APPROVED`: owner, reviewer y criterios más amplios
pueden continuar pendientes.
