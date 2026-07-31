# [SPEC-221] CI/CD & Release Management

Contrato transversal para integrar, verificar, desplegar, promover y revertir cambios de Maitre de manera reproducible y auditable.

| Campo                | Valor                                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| **ID**               | SPEC-221                                                                                        |
| **Tipo**             | Transversal                                                                                     |
| **Subtype**          | Delivery Engineering                                                                            |
| **Dominio**          | Platform / Operations                                                                           |
| **Estado**           | DRAFT                                                                                           |
| **Readiness**        | PARTIAL                                                                                         |
| **Blockers**         | Branch protection, previews aisladas, owner/reviewer y gates de producción comercial pendientes |
| **Prioridad**        | P0                                                                                              |
| **Owner / Reviewer** | UNASSIGNED / UNASSIGNED                                                                         |
| **Fase**             | Delivery I0 automatizado; promoción y production readiness pendientes                           |
| **Depende de**       | SPEC-207–220                                                                                    |

## Decisiones centrales

- Desarrollo trunk-based con ramas cortas y `main` protegida.
- Conventional Commits para historial y automatización.
- Preview por pull request, development desde `main` y demo mediante promoción aprobada.
- El mismo commit/artefacto se promueve; no se reconstruye código diferente por ambiente.
- Migraciones expand/migrate/contract y forward-only durante el MVP.
- Rollback de aplicación separado de recuperación/compensación de datos.
- Production permanece deshabilitado hasta cumplir gates comerciales, operativos y de seguridad.
- GitHub Actions es la autoridad de delivery: valida PR/main y despliega selectivamente desde
  `main` sin depender de la Vercel GitHub App.

## Estado implementado — 2026-07-30

- `End-to-end` ejecuta Quality, matrices E2E y deploys Vercel.
- `CodeQL` valida JavaScript/TypeScript por separado.
- `tooling/deployment/detect-affected.mjs` calcula matrices deterministas por paths.
- Cambios globales o desconocidos usan fallback conservador completo.
- Cambios documentales no consumen E2E ni deployments.
- `workflow_dispatch` valida y redespliega los siete proyectos.
- `E2E gate` agrega matrices selectivas y el journey release autoritativo.
- El journey usa Supabase efímero, migra desde cero y prueba persistencia después de reiniciar la
  API.
- Quality y journey publican evidencia sanitizada asociada al run/SHA.
- El deploy de API valida el perfil descargado y prueba `/health/live` y `/health/ready` en la URL
  inmutable.
- El deploy desde PR permanece deshabilitado; sólo un push a `main` puede usar secretos de
  producción.
- GitHub Actions, no la Vercel GitHub App, es la autoridad de validación y delivery.

Siguen pendientes los controles indicados como blockers. Este estado operativo no equivale a
habilitar producción comercial.

## Documentos

- [Contrato](contract.md)
- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
- [Decisiones](notes.md)
- [Contrato de delivery I0](i0-delivery-contract.md)

I0 usa validación por PR y deployment selectivo desde `main` al target Vercel configurado. No
existe destino de producción comercial ni deployment remoto `development` separado. Los previews
aislados y la promoción sin rebuild siguen siendo trabajo pendiente.
