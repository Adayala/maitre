# SDD Status Update

**Fecha:** 2026-07-30

**Alcance:** cierre técnico del MVP Demo y estado de sus gates transversales

## Resumen

El corte integrado en `main` cerró los gaps detectados entre SPEC-215, SPEC-216, SPEC-222 y
SPEC-224 para el **MVP Demo**. La fuente consolidada de implementación, evidencia y límites es
[Cierre de gaps del MVP — 30 de julio de 2026](../operations/mvp-gap-closure-2026-07-30.md).

Este estado no afirma que todo el catálogo SDD esté implementado ni cambia por sí mismo el
lifecycle de una SPEC. Cada README sigue siendo autoritativo para metadata, aprobación, blockers y
readiness.

## Capacidades integradas

| Área | Estado del corte MVP Demo | Evidencia principal |
| --- | --- | --- |
| Contrato HTTP | `IMPLEMENTED` | OpenAPI versionado, lint, drift/breaking gate, Problem Details y CORS allowlist exacta. |
| Auditoría sensible | `IMPLEMENTED_HTTP_BOUNDARY` | Policy obligatoria para mutaciones Floor, Ordering, Kitchen y Cash, redacción y evidencia correlacionada. |
| Observabilidad | `OPERATIONAL_LOCAL` / `OPERATIONAL_CI` | RED HTTP, trazas, señales de recorrido/audit/outbox, export test y artefacto sanitizado. |
| Recorrido MVP | `OPERATIONAL_CI` | MVP-J-001: setup → mesa → pedido → cocina → cuenta → pago → cierre → Dash/audit. |
| Runtime compartido | `IMPLEMENTED` | Supabase/auth explícitos, prohibición fail-closed de memory/fixture y CORS inseguro. |
| Persistencia durable | `OPERATIONAL_CI` | Supabase efímero, migraciones desde cero, restart de API y relectura PostgreSQL. |
| Delivery | `IMPLEMENTED_I0` | Quality/E2E antes de deploy, preflight de ambiente y probes post-deploy. |

## Validación reproducible

El pipeline `End-to-end` es la autoridad de delivery. Sus gates relevantes ejecutan, entre otros:

```bash
npm run sdd:validate
npm run openapi:check
npm run openapi:breaking
npm run runtime:profile:test
npm run runtime:grants:test
npm run test:telemetry:export
npm run observability:evidence
npm run e2e:journey:policy
npm run test:e2e:journey:run
npm run test:e2e:journey:restart
```

El journey release debe producir evidencia sanitizada, terminar su cleanup y conservar lecturas
durables después de reiniciar la API. `FAILED`, `INFRA_ERROR`, falta de evidencia o cleanup
incompleto bloquean el deploy.

## Pull requests del cierre

- Auditoría: [#58](https://github.com/Adayala/maitre/pull/58) y
  [#64](https://github.com/Adayala/maitre/pull/64).
- Observabilidad: [#59](https://github.com/Adayala/maitre/pull/59) y
  [#65](https://github.com/Adayala/maitre/pull/65).
- Contrato HTTP: [#60](https://github.com/Adayala/maitre/pull/60) y
  [#66](https://github.com/Adayala/maitre/pull/66).
- Journey y persistencia: [#61](https://github.com/Adayala/maitre/pull/61),
  [#63](https://github.com/Adayala/maitre/pull/63),
  [#68](https://github.com/Adayala/maitre/pull/68) y
  [#72](https://github.com/Adayala/maitre/pull/72).
- Runtime y deployment: [#67](https://github.com/Adayala/maitre/pull/67) y
  [#70](https://github.com/Adayala/maitre/pull/70).
- Integración consolidada: [#69](https://github.com/Adayala/maitre/pull/69) y
  [#71](https://github.com/Adayala/maitre/pull/71).

## No completado

Permanece fuera del cierre del MVP Demo:

- unit-of-work PostgreSQL atómico para estado de negocio, outbox y audit;
- pruebas exhaustivas de rollback/idempotencia auditada por cada transición;
- backend OTLP remoto, dashboards, alertas, paging y SLO/error-budget operativos;
- previews aisladas, branch protection y promoción staged sin rebuild;
- aprobación comercial, ASVS, DR, on-call y soporte del MVP Pilot.

Estas capacidades no deben rotularse `OPERATIONAL` hasta contar con backend/configuración,
responsable y evidencia end-to-end cuando corresponda.

## Próximas acciones

1. Resolver owners/reviewers y aprobar formalmente las SPEC transversales.
2. Seleccionar y operar el backend OTLP conforme a ADR-005.
3. Implementar la unidad transaccional audit/outbox y completar sus escenarios negativos.
4. Completar los gates de promoción y readiness del MVP Pilot.

**Owner:** UNASSIGNED

**Próxima revisión:** antes de declarar listo el MVP Pilot
