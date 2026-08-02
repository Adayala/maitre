# [SPEC-045] Audit API

Consulta read-only `GET /v1/audit-logs` con filtros acotados, cursor estable y redacción por
permission/classification.

## Metadata

| Campo                | Valor                                                                         |
| -------------------- | ----------------------------------------------------------------------------- |
| **ID**               | SPEC-045                                                                      |
| **Tipo**             | API                                                                           |
| **Dominio**          | Audit                                                                         |
| **Estado**           | IN_PROGRESS                                                                   |
| **Readiness**        | WALKING_SKELETON_I0                                                           |
| **Prioridad**        | P0                                                                            |
| **Review target**    | READY_FOR_I0_REVIEW                                                           |
| **Owner / Reviewer** | UNASSIGNED / UNASSIGNED                                                       |
| **Blockers**         | Acordar filtros allowlisted, paginación estable y redacción por clasificación |
| **Fase**             | I0                                                                            |
| **Estimación**       | UNASSESSED                                                                    |

## Estado implementado

El read model, la API read-only y la instrumentación representativa de mutaciones sensibles del
MVP están implementados con tenant/correlation context y redacción. Continúan pendientes la unidad
de trabajo atómica para estado + outbox + audit, la matriz exhaustiva por dominio y las alertas
operativas. El historial enlazado abajo registra exactamente ese corte parcial.

## Documentos

- [Contrato](contract.md)
- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Reglas](rules.md)
- [Verificación](verification.md)
- [Historial: auditoría de mutaciones sensibles](implementation-history/audit-mvp-sensitive-mutations/proposal.md)
