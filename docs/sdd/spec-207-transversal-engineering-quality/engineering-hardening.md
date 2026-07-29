# Hardening de ingeniería

Este documento es el contrato operativo de calidad, seguridad, performance y entrega de Maitre. Los controles viven en el repositorio y se ejecutan igual en una notebook y en CI.

## Resultado implementado

| Área                      | Control                                                                                                | Evidencia / comando                                                |
| ------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Reproducibilidad          | Node 20.19 y npm 10.8 declarados; instalación inmutable                                                | `npm ci`                                                           |
| Calidad                   | formato, ESLint sin warnings, TypeScript estricto y links SDD                                          | `npm run format:check`, `lint`, `typecheck`, `sdd:validate`        |
| Arquitectura              | ciclos y dependencias entre capas prohibidas                                                           | `npm run deps:check`                                               |
| Tests                     | tests Node, coverage nativo con umbral de no regresión y seis suites Playwright independientes         | `npm run test:coverage`, `npm run test:e2e:run -- --project=<app>` |
| Accesibilidad             | WCAG A/AA; bloquea impactos serios o críticos                                                          | evidencia `accessibility.json` en Playwright                       |
| Seguridad de supply chain | audit de dependencias, secret scan, Dependabot, CodeQL y SBOM CycloneDX                                | `npm run security:audit`, `secrets:scan`                           |
| API                       | headers seguros, CORS explícito en producción, límite de body, timeouts, proxy controlado y rate limit | tests/build de API                                                 |
| Performance               | presupuesto gzip por frontend                                                                          | `npm run performance:budget`                                       |
| Ownership                 | CODEOWNERS, plantilla de PR y política de reporte privado                                              | `.github/CODEOWNERS`, `SECURITY.md`                                |
| Entrega                   | deploy de `main` depende de `Quality gate` y del agregador estable `E2E gate`                          | workflow `End-to-end`                                              |

## Regla obligatoria para features nuevas

`AGENTS.md` establece la Definition of Done para todos los agentes del proyecto:

- 100% de statements, branches, functions y lines sobre todo código nuevo o modificado;
- cobertura Playwright completa para toda parte visual, granularizada por aplicación;
- estados happy path, loading, empty, validación, error, permisos, responsive, accesibilidad e integración incluidos cuando correspondan;
- prohibido bajar thresholds, excluir archivos o eliminar assertions para obtener un PASS.

Una feature no puede declararse terminada mientras falte evidencia de estas condiciones. La cuarentena histórica descrita debajo no autoriza deuda nueva.

## Pipeline

Cada pull request dispara:

1. `Quality gate`: formato, lint, tipos, boundaries, documentación, build/tests/coverage, seguridad, bundles y SBOM.
2. Un job Playwright visible por aplicación: Dash, Host, Floor, Kitchen, Cash y Guest.
3. `E2E gate`, que falla si cualquier aplicación afectada no terminó correctamente y pasa cuando no hay E2E aplicables.
4. CodeQL para JavaScript/TypeScript.

En `main`, los siete despliegues Vercel sólo comienzan si `Quality gate` y `E2E gate` terminaron correctamente. El agregador tiene nombre estable aunque cambie la matriz de aplicaciones afectadas, por lo que puede proteger `main` sin dejar pasar una suite omitida ni exigir jobs que no correspondan al cambio. El workflow histórico `Deploy to Vercel` queda sólo para ejecución manual controlada.

La matriz E2E usa la imagen oficial de Playwright fijada a la misma versión del lockfile. Esto evita instalar Chromium y paquetes del sistema seis veces, conserva aislamiento por aplicación y reduce tiempo y variabilidad.

## Política de dependencias

- Dependabot agrupa minor/patch semanales y mantiene majors separados para revisión consciente.
- Vulnerabilidades `high` o `critical` bloquean.
- La excepción `GHSA-qwww-vcr4-c8h2` vence el 31-08-2026. La aplicación usa React Router como SPA y no expone React Server Actions/RSC; el vencimiento fuerza revalidar o actualizar.
- El SBOM se conserva 14 días por run para trazabilidad.

## Presupuestos y evolución

Los límites iniciales están en `tooling/performance/budgets.json` y se miden sobre la suma gzip de JS/CSS de cada frontend. Un aumento requiere justificar impacto en el PR; preferentemente se optimiza o divide el bundle antes de subir el presupuesto.

El coverage nativo de Node bloquea regresiones contra el baseline versionado en
`tooling/quality/coverage-thresholds.json`: 78 % de líneas, 82 % de branches y 81 % de funciones.
El reporte completo queda en `coverage/node-test-coverage.txt` y se publica como artifact de CI. Los
umbrales globales son un piso histórico y no reemplazan la exigencia de 100 % sobre código nuevo o
modificado. Subirlos requiere evidencia; bajarlos está prohibido salvo decisión explícita y
justificada. Las journeys autenticadas y transversales deben agregarse bajo la aplicación dueña y
etiquetarse; no deben volver a crear un job monolítico.

Al activar el runner se descubrieron cinco suites API con fallos previos de contrato/fixtures.
`kitchen-api`, `ordering-api` y `reservations-api` fueron reconciliadas con sus representaciones y
fixtures vigentes y volvieron al quality gate. Las dos restantes (`organization-api` y
`workforce-api`) siguen en una cuarentena explícita en `run-node-tests.mjs`; las otras 77 suites
bloquean CI. Sacarlas requiere corregir la implementación o actualizar cada contrato con su spec,
nunca borrar assertions. La cuarentena es deuda P0 y cualquier suite nueva queda incluida por
defecto.

## Operación local

```bash
npm ci
npm run format:check
npm run lint
npm run typecheck
npm run deps:check
npm run test:coverage
npm run secrets:scan
npm run security:audit
npm run performance:budget
```

Para una sola webapp:

```bash
E2E_APP=host npm run test:e2e:run -- --project=host
```

Antes hace falta construir API y aplicación, o usar `npm run test:e2e`, que construye todo.

## Configuración obligatoria de GitHub

Un administrador debe proteger `main` con:

- pull request obligatorio y conversación resuelta;
- al menos una aprobación de code owner;
- branch actualizada antes del merge;
- checks requeridos `Quality gate`, `E2E gate` y `CodeQL · JavaScript/TypeScript`;
- prohibir force-push y delete;
- aplicar reglas también a administradores, con bypass sólo de emergencia y auditable.

Esto no puede garantizarse sólo con archivos versionados: la ruleset vive en la configuración del repositorio. Tras activarla, ejecutar los canarios definidos en `quality-gates.md`.

## Próximos incrementos

1. Resolver y retirar la cuarentena de las dos suites API restantes.
2. Incorporar entorno Supabase efímero y prueba de migraciones cuando exista una configuración local reproducible.
3. Añadir journeys autenticadas de rol y una journey transversal de reserva → salón → cocina → caja.
4. Publicar métricas de lead time, flaky rate, duración p95 y frecuencia de rollback.
5. Añadir monitoreo sintético post-deploy y rollback automatizado cuando existan endpoints y credenciales de observabilidad.

Estos puntos quedan explícitos porque requieren fixtures/infra o decisiones de producto; fingirlos en CI sin un entorno real produciría falsos positivos.
