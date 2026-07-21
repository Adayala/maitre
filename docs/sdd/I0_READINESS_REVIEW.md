# I0 Readiness Review

**Fecha:** 2026-07-21

**Alcance:** SPEC-207 a SPEC-225 y dependencias del walking skeleton

**Resultado:** NOT READY — contratos reconciliados; aprobación, owners, implementación de gates y evidencia SPK pendientes

## Resumen

La base documental transversal y los contratos funcionales I0 están reconciliados y listos para peer review. Continúan en `DRAFT` y no autorizan implementación productiva según SPEC-207/225; ADR-002/003 siguen `PROPOSED` y los spikes están `NOT_RUN`.

## Correcciones completadas

- SPEC-207 ahora contiene `objective.md`.
- SPEC-208 ahora contiene `objective.md` y `plan.md`.
- TECH_STACK distingue decisión base aceptada de proveedores/toolchain propuestos.
- Se creó registro ADR.
- ADR-001 documenta la decisión explícita React.js + Node.js + Vercel.
- ADR-002 y ADR-003 quedan propuestos, no aceptados.
- SPEC-001/004/017/020/023 y `/v1/me/context` fueron reconciliadas; I0-B04 queda resuelto en draft.
- SPEC-208 contiene registro operativo fechado; I0-B07 queda resuelto documentalmente, pendiente verificación de dashboards.
- SPEC-207 define `specs:validate` y la matriz de gates; la implementación sigue pendiente.

## Blockers para READY_FOR_IMPLEMENTATION

| ID | Blocker | Resolución requerida |
| --- | --- | --- |
| I0-B01 | SPEC-207–225 están DRAFT | revisión/aprobación del subset realmente requerido |
| I0-B02 | Metadata no declara owners/reviewers uniformes | asignar roles o `UNASSIGNED` explícito |
| I0-B03 | Supabase y toolchain no tienen ADR aceptada | ejecutar [`SPEC-226`](spec-226-transversal-i0-platform-validation-spikes/) y aprobar/rechazar ADR-002/003 |
| I0-B04 | RESOLVED IN DRAFT: contratos funcionales reconciliados | aprobar en peer review [`I0_FUNCTIONAL_CONTRACT_REVIEW.md`](I0_FUNCTIONAL_CONTRACT_REVIEW.md) |
| I0-B05 | Existe contrato `specs:validate`, no implementación | implementar gate mecánico durante el scaffold y probar canario |
| I0-B06 | Branch protection/GitHub checks no verificados | configurar según SPEC-221 cuando autenticación admin esté disponible |
| I0-B07 | RESOLVED DOCUMENTALLY: registro fechado en SPEC-208; dashboards no auditados | auditar cuentas antes de desplegar demo compartida |

## No bloquean scaffolding local, pero sí hitos posteriores

- ASVS L2 completo y revisión legal: bloquean MVP Pilot/datos reales, no un scaffold sin datos.
- ARCA/IVA y certificados: bloquean I6 fiscal/piloto si Maitre emite, no I0.
- Offline completo y push realtime: bloquean sólo el piloto que los requiera; I0 usa estados/fallbacks.
- RPO/RTO productivos: production permanece deshabilitado.

## Subset propuesto para I0

| Spec | Rol en I0 |
| --- | --- |
| SPEC-207 | gates y Definition of Done |
| SPEC-208 | presupuesto demo |
| SPEC-209 | estructura y dependencias |
| SPEC-210 | datos/identidad, sujeto a ADR-002 |
| SPEC-211 | toolchain, sujeto a ADR-003 |
| SPEC-212 | tokens/primitivas mínimas |
| SPEC-213 | recorrido walking skeleton |
| SPEC-214 | config/secretos/ambientes |
| SPEC-215 | health/context API |
| SPEC-216 | telemetría mínima |
| SPEC-219 | baseline de seguridad/tenant |
| SPEC-220 | backup demo mínimo |
| SPEC-221 | CI/deploy preview/development |
| SPEC-224 | harness de tests |
| SPEC-225 | lifecycle y validación SDD |

SPEC-217/218/223 permanecen dependencias diseñadas para incrementos operativos posteriores y no deben ampliar el scaffold I0 salvo interfaces mínimas ya justificadas.

## Próxima decisión

Realizar peer review del subset I0 y asignar owners/reviewers. Luego ejecutar SPK-01/05 localmente y SPK-02/03/04/06 cuando el proyecto Supabase esté vinculado. Sólo con evidencia y ADR-002/003 aceptadas se puede aprobar `READY_FOR_IMPLEMENTATION` explícitamente.
