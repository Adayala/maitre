# [SPEC-216] Observability & Reliability

Contrato para detectar, entender y recuperar fallos de Maitre con telemetría portable y operación sostenible en free tier.

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-216 |
| **Tipo** | Transversal / Reliability Engineering |
| **Dominio** | Platform / Operations |
| **Estado** | DRAFT — PROPOSED FOR APPROVAL |
| **Prioridad** | P0 |
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
