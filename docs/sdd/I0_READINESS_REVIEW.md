# I0 Readiness Review

**Fecha:** 2026-07-21

**Alcance:** SPEC-207 a SPEC-225 y dependencias del walking skeleton

**Resultado:** NOT READY — aprobación y blockers pendientes

## Resumen

La base documental transversal está completa en estructura después de agregar los archivos faltantes de SPEC-207/208. Sin embargo, las specs continúan en `DRAFT` y no autorizan implementación según SPEC-207/225.

## Correcciones completadas

- SPEC-207 ahora contiene `objective.md`.
- SPEC-208 ahora contiene `objective.md` y `plan.md`.
- TECH_STACK distingue decisión base aceptada de proveedores/toolchain propuestos.
- Se creó registro ADR.
- ADR-001 documenta la decisión explícita React.js + Node.js + Vercel.
- ADR-002 y ADR-003 quedan propuestos, no aceptados.

## Blockers para READY_FOR_IMPLEMENTATION

| ID | Blocker | Resolución requerida |
| --- | --- | --- |
| I0-B01 | SPEC-207–225 están DRAFT | revisión/aprobación del subset realmente requerido |
| I0-B02 | Metadata no declara owners/reviewers uniformes | asignar roles o `UNASSIGNED` explícito |
| I0-B03 | Supabase y toolchain no tienen ADR aceptada | ejecutar [`SPEC-226`](spec-226-transversal-i0-platform-validation-spikes/) y aprobar/rechazar ADR-002/003 |
| I0-B04 | Dependencias funcionales SPEC-001/004/017/020/023 contienen contradicciones P0 | resolver [`I0_FUNCTIONAL_CONTRACT_REVIEW.md`](I0_FUNCTIONAL_CONTRACT_REVIEW.md) |
| I0-B05 | No existe implementación de `sdd:validate` | implementar gate mecánico antes de escalar cambios |
| I0-B06 | Branch protection/GitHub checks no verificados | configurar según SPEC-221 cuando autenticación admin esté disponible |
| I0-B07 | Cuotas/términos vigentes no están en registro operativo fechado | verificar antes de desplegar demo compartida |

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

Revisar ADR-002 y ADR-003 mediante spikes acotados y reconciliar las cinco specs funcionales según [`I0_FUNCTIONAL_CONTRACT_REVIEW.md`](I0_FUNCTIONAL_CONTRACT_REVIEW.md). Si pasan sus criterios, mover únicamente el subset I0 a `IN_REVIEW`; después resolver metadata/blockers y aprobar `READY_FOR_IMPLEMENTATION` de forma explícita.
