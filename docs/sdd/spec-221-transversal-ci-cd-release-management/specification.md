# Especificación — SPEC-221

## 1. Estrategia de ramas

- `main` es integrable y representa el estado candidato más reciente.
- Features/fixes usan ramas cortas con nombres descriptivos.
- Pull requests pequeños enlazan spec/issue, riesgo, evidencia y rollback.
- Desde el primer código productivo, `main` requiere el check agregador y pull request. Reviews se exigen cuando exista reviewer habilitado independiente.
- Push directo/force-push/deletion se restringen cuando plan/visibilidad lo permitan; la disponibilidad se audita antes de declararlo configurado.
- No se mantienen ramas permanentes por ambiente.

## 2. Commits y versionado

Se usan Conventional Commits:

```text
feat(scope): add capability
fix(scope): correct behavior
docs(sdd): define contract
refactor(scope): restructure without behavior change
test(scope): add verification
build(scope): change build or dependencies
ci(scope): change delivery workflow
chore(scope): maintenance without product behavior
```

- Un breaking change usa `!` y/o footer `BREAKING CHANGE:`.
- Scope representa dominio/app/paquete estable, no ticket circunstancial.
- Commits no mezclan cambios funcionales independientes.
- Release tags siguen SemVer cuando exista una entrega consumible.
- La versión desplegada expone commit SHA y release de forma sanitizada, no detalles sensibles.

Durante I0 se valida el título del PR como Conventional Commit y se usa squash merge para producir un commit coherente. Commits directos previos al branch protection conservan el estándar, pero no constituyen el flujo futuro aprobado.

## 3. Pipeline de pull request

Orden de feedback recomendado:

1. instalación reproducible y cache verificada;
2. format/lint, secret scan y validación SDD;
3. typecheck y dependency boundaries;
4. unit/component/contract tests;
5. build web/API y documentación UI sólo si ADR-004 la adopta;
6. SAST/SCA/Sonar y OpenAPI breaking check;
7. integration/RLS/migrations;
8. Playwright/accessibility en preview cuando corresponda.

Jobs independientes corren en paralelo. Concurrency cancela ejecuciones obsoletas de la misma
rama. Path filtering puede omitir trabajo irrelevante sólo si un detector versionado y probado
demuestra qué gates aplican. La implementación actual usa
`tooling/deployment/detect-affected.mjs`: cambios compartidos o desconocidos seleccionan todo;
docs-only omite E2E/deploy pero no Quality.

## 4. Ambientes y promoción

```text
PR commit → Preview (`APP_ENV=preview`)
merge/squash SHA en main → staged Production build (`APP_ENV=demo`)
approved staged build → current demo, sin rebuild
approved release → production (future gate)
```

- Preview usa datos sintéticos y secretos mínimos según SPEC-214.
- I0 no provisiona un deployment remoto `development`; local/CI y Preview cubren integración.
- `main` produce un build Production staged con auto-asignación de dominio deshabilitada.
- Demo promueve manualmente ese mismo staged deployment después de smoke; no se promueve Preview porque ello reconstruye con otra configuración.
- El build se identifica y verifica; configuración se inyecta por ambiente.
- No se copia una base de datos real para crear preview/demo.
- Previews expiran y se limpian para proteger cuota.

## 5. Artefactos y reproducibilidad

- `npm ci` y lockfile son obligatorios.
- Node/npm y toolchain están fijados.
- Builds no descargan código mutable fuera de dependencias bloqueadas.
- Se conserva metadata: commit, workflow, timestamp, tool versions y hashes.
- Web, API, OpenAPI, documentación UI adoptada y reports se asocian al mismo SHA.
- Un deploy puede reproducirse localmente/CI sin APIs exclusivas de Vercel.
- Artefactos no incluyen `.env`, secretos, dumps, tokens o source maps públicos no aprobados.

## 6. Migraciones de base

Las migraciones siguen expand/migrate/contract:

1. **expand:** agregar estructura compatible y nullable/default seguro;
2. **migrate:** backfill acotado, observable, reiniciable e idempotente;
3. **switch:** código lee/escribe el nuevo modelo de forma compatible;
4. **contract:** eliminar lo anterior después de verificar uso y ventana de rollback.

- SQL versionado es fuente de verdad.
- Migration job usa credencial separada y lock/advisory control.
- Aplicación no ejecuta migraciones automáticamente en cada cold start.
- Toda migración se prueba desde cero y desde schema anterior representativo.
- Operaciones destructivas requieren backup/restore válido, aprobación y plan compensatorio.
- Down migrations no se presumen seguras; rollback de datos es compensación/restore explícito.

Preview nunca recibe `DATABASE_MIGRATION_URL`. Un workflow/manual autorizado separado aplica migraciones expand compatibles al proyecto compartido antes del staged deployment que las necesita. El build Vercel y el arranque API no ejecutan schema changes.

## 7. Estrategia de release

Un release candidate registra:

- specs/issues incluidas y cambios incompatibles;
- commit/tag y artefactos;
- migraciones/configuración/flags requeridos;
- evidencia de gates y excepciones;
- impacto esperado, SLO/error budget y capacidad free tier;
- procedimiento de deploy, smoke, rollback y reconciliación;
- owner y ventana.

Feature flags separan deploy de release sólo cuando existe plan de activación, owner y retiro. Nunca reemplazan autorización ni protecciones server-side.

## 8. Deployment seguro

1. verificar ambiente, SHA, config y dependencias;
2. comprobar backup cuando el cambio de datos lo requiera;
3. ejecutar expansión/migración compatible;
4. desplegar API/web;
5. ejecutar health, smoke, synthetic y checks de seguridad;
6. observar métricas/logs/traces durante ventana definida;
7. activar flag/tráfico gradualmente si aplica;
8. cerrar release o iniciar rollback.

No se despliega si readiness, error budget, cuota o dependencia crítica indican riesgo no aprobado.

En I0 no existe error-budget gate operativo según SPEC-216. Se evalúan health, smoke, tests, cuota y blockers reales; no se exige una señal marcada `NOT_OPERATIONAL`.

## 9. Rollback y roll-forward

- Revertir aplicación usa el último artefacto compatible conocido.
- Configuración se revierte a una versión compatible y auditada.
- Una migración expand compatible permanece durante rollback.
- Cambios de datos ya ejecutados se compensan o restauran según SPEC-220.
- Eventos, pagos, emails y ARCA se reconcilian; rollback no deshace efectos externos automáticamente.
- Para defectos pequeños con datos compatibles se prefiere roll-forward probado cuando reduzca riesgo/tiempo.
- Todo rollback produce incidente o change record y acción de seguimiento.

## 10. Gates por tipo de cambio

| Cambio      | Evidencia adicional                                  |
| ----------- | ---------------------------------------------------- |
| Docs/spec   | links, formato, consistencia y aprobación            |
| UI          | Storybook, axe, keyboard, screenshots/E2E            |
| API         | OpenAPI, contract/breaking checks y auth negativo    |
| DB/RLS      | migration, integration, cross-tenant y restore       |
| Dependencia | SCA, licencia, bundle y justificación                |
| Offline     | chaos/sync/conflict y compatibilidad cliente         |
| Evento      | schema, outbox/inbox, replay y consumidor            |
| Fiscal/pago | idempotencia, reconciliación, auditoría y aprobación |
| Seguridad   | threat model/ASVS evidence y abuso                   |

## 11. Release de emergencia

- Sólo para impacto P1/P2 confirmado.
- Cambio mínimo, owner y rollback explícitos.
- No se omiten secret scan, build, tests críticos ni autorización.
- Gates extensos pueden ejecutarse inmediatamente después sólo si el riesgo de esperar es mayor y queda registrado.
- Revisión retrospectiva y backport de tests obligatorios.

## 12. Cuota y eficiencia

- Cancelar runs obsoletos y evitar matrices amplias por cada commit.
- Chromium en PR; navegadores adicionales en schedule/release.
- Cache por lockfile y herramientas, nunca secretos.
- Integration/E2E costosos se activan por impacto más un schedule completo.
- Nightly/scheduled jobs tienen owner, presupuesto y política de fallo.
- Si una optimización oculta defectos o vuelve opcional un gate, se revierte.

### Implementación selectiva vigente

- Frontend aislado: E2E y deploy de esa aplicación.
- API/Supabase: todos los E2E de clientes y deploy sólo de API.
- Paquete/adaptador/lockfile/config compartida: todos los E2E y deploys.
- Tests E2E: todos los E2E sin deploy.
- Documentación: Quality sin E2E ni deploy.
- Ruta no clasificada: fallback completo.
- Ejecución manual: validación y deploy completo.

La matriz de deploy sólo se evalúa en `push` a `main` y depende de Quality más todos los E2E
seleccionados.

## 13. Restricciones del proveedor inicial

- Vercel Hobby es no comercial según SPEC-208.
- El commit author debe ser compatible con el ownership del Hobby team para que Git deployment no sea rechazado; colaboración Adrian/usuario debe auditarse.
- Preview de forks no recibe secrets y requiere autorización explícita del owner cuando Vercel lo solicite.
- Production target significa demo sintética (`APP_ENV=demo`), no readiness comercial.
- Si branch protection no está disponible por visibilidad/plan, el blocker permanece abierto; no se reemplaza con una convención informal.
