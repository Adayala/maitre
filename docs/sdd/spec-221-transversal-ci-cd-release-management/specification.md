# Especificación — SPEC-221

## 1. Estrategia de ramas

- `main` es integrable y representa el estado candidato más reciente.
- Features/fixes usan ramas cortas con nombres descriptivos.
- Pull requests pequeños enlazan spec/issue, riesgo, evidencia y rollback.
- `main` requiere checks y review cuando exista más de un contributor habilitado.
- Push directo se restringe cuando la configuración de GitHub lo permita; emergencias quedan auditadas y seguidas por revisión.
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

## 3. Pipeline de pull request

Orden de feedback recomendado:

1. instalación reproducible y cache verificada;
2. format/lint, secret scan y validación SDD;
3. typecheck y dependency boundaries;
4. unit/component/contract tests;
5. build web/API/Storybook;
6. SAST/SCA/Sonar y OpenAPI breaking check;
7. integration/RLS/migrations;
8. Playwright/accessibility en preview cuando corresponda.

Jobs independientes corren en paralelo. Concurrency cancela ejecuciones obsoletas de la misma rama. Path filtering puede omitir trabajo irrelevante sólo si un check agregador demuestra que ningún gate requerido quedó sin ejecutar.

## 4. Ambientes y promoción

```text
PR commit → preview
merge commit/main SHA → development
approved main SHA/tag → demo
approved release → production (future gate)
```

- Preview usa datos sintéticos y secretos mínimos según SPEC-214.
- Development despliega automáticamente desde `main` después de gates.
- Demo se promueve manualmente desde un SHA verde y ejecuta smoke/E2E.
- El build se identifica y verifica; configuración se inyecta por ambiente.
- No se copia una base de datos real para crear preview/demo.
- Previews expiran y se limpian para proteger cuota.

## 5. Artefactos y reproducibilidad

- `npm ci` y lockfile son obligatorios.
- Node/npm y toolchain están fijados.
- Builds no descargan código mutable fuera de dependencias bloqueadas.
- Se conserva metadata: commit, workflow, timestamp, tool versions y hashes.
- Web, API, OpenAPI, Storybook y reports se asocian al mismo SHA.
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

## 9. Rollback y roll-forward

- Revertir aplicación usa el último artefacto compatible conocido.
- Configuración se revierte a una versión compatible y auditada.
- Una migración expand compatible permanece durante rollback.
- Cambios de datos ya ejecutados se compensan o restauran según SPEC-220.
- Eventos, pagos, emails y ARCA se reconcilian; rollback no deshace efectos externos automáticamente.
- Para defectos pequeños con datos compatibles se prefiere roll-forward probado cuando reduzca riesgo/tiempo.
- Todo rollback produce incidente o change record y acción de seguimiento.

## 10. Gates por tipo de cambio

| Cambio | Evidencia adicional |
| --- | --- |
| Docs/spec | links, formato, consistencia y aprobación |
| UI | Storybook, axe, keyboard, screenshots/E2E |
| API | OpenAPI, contract/breaking checks y auth negativo |
| DB/RLS | migration, integration, cross-tenant y restore |
| Dependencia | SCA, licencia, bundle y justificación |
| Offline | chaos/sync/conflict y compatibilidad cliente |
| Evento | schema, outbox/inbox, replay y consumidor |
| Fiscal/pago | idempotencia, reconciliación, auditoría y aprobación |
| Seguridad | threat model/ASVS evidence y abuso |

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
