# [SPEC-216] Observability & Reliability

Contrato para detectar, entender y recuperar fallos de Maitre con telemetría portable y operación sostenible en free tier.

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-216 |
| **Tipo** | Transversal / Reliability Engineering |
| **Dominio** | Platform / Operations |
| **Estado** | DRAFT |
| **Readiness** | BLOCKED |
| **Review target** | READY_FOR_I0_REVIEW |
| **Prioridad** | P0 |
| **Owner** | UNASSIGNED |
| **Reviewer** | UNASSIGNED |
| **Blockers** | Asignar owner y reviewer |
| **Fase** | Antes del ambiente demo estable |
| **Depende de** | SPEC-207–215 |

## Decisiones centrales

- OpenTelemetry detrás de `TelemetryPort`.
- Logging estructurado con allowlist y redacción.
- Métricas orientadas a usuario y negocio, sin labels de alta cardinalidad.
- SLOs iniciales medidos antes de contratar un proveedor.
- Alertas accionables y runbooks versionados.
- Exportación configurable; ningún SaaS forma parte del dominio.

## Documentos

- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
- [Decisiones](notes.md)
- [Contrato de telemetría I0](i0-telemetry-contract.md)

I0 implementa correlación, logs seguros, health y evidencia local/CI. SLOs, dashboards y alertas permanecen `NOT_OPERATIONAL` hasta seleccionar un backend/canal y asignar owner.
