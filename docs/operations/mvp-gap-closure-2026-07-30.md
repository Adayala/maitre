# Cierre de gaps del MVP — 30 de julio de 2026

## Resultado

Los gaps detectados entre SPEC-215, SPEC-216, SPEC-222 y la implementación quedaron cubiertos para
el alcance **MVP Demo**. El cierre comprende contrato HTTP gobernado, auditoría uniforme en el
boundary HTTP sensible, observabilidad portable y operable en CI, runtime compartido durable y un
recorrido Playwright autoritativo que persiste después de reiniciar la API.

Este documento registra el estado implementado. No reemplaza las especificaciones normativas ni
convierte en operativas las capacidades diferidas al **MVP Pilot**.

## Matriz de cierre

| Gap original | Estado | Implementación y evidencia |
| --- | --- | --- |
| OpenAPI ausente y sin detección de breaking changes | `IMPLEMENTED` | Artefacto versionado en [`apps/api/openapi/openapi.json`](../../apps/api/openapi/openapi.json), generación determinista, policy lint y comparación contra merge base mediante `openapi:check` y `openapi:breaking`. |
| Problem Details/content type incompleto | `IMPLEMENTED` | Boundary central en [`problem-details.ts`](../../apps/api/src/http/problem-details.ts), respuestas `application/problem+json`, URI `type`, `code`, `instance`, status y correlation ID verificables. |
| CORS con reflexión abierta | `IMPLEMENTED` | Allowlist exacta por `CORS_ALLOWED_ORIGINS`; shared runtime falla cerrado ante wildcard, credenciales, path, valor vacío u origen inválido. |
| Auditoría parcial en Floor, Ordering, Kitchen y Cash | `IMPLEMENTED_HTTP_BOUNDARY` | Registro obligatorio en [`mutation-audit.ts`](../../apps/api/src/http/mutation-audit.ts), startup fail-fast ante rutas sensibles sin policy, redacción central, filtros operativos y evidencia representativa en MVP-J-001. |
| Métricas/trazas/backlog de outbox ausentes | `OPERATIONAL_LOCAL` / `OPERATIONAL_CI` | `TelemetryPort`, adapter OpenTelemetry OTLP, RED HTTP, auth/context/DB, recorrido, auditoría y backlog/edad/retries/failures del outbox; evidencia sanitizada obligatoria en CI. |
| E2E limitado a smoke de navegación | `OPERATIONAL_CI` | [`mvp-j-001.spec.ts`](../../tests/e2e/journeys/mvp-j-001.spec.ts) recorre setup → mesa → pedido → cocina → cuenta → pago → cierre → Dash/audit y aislamiento Tenant B. |
| Persistencia compartida podía caer a memoria | `IMPLEMENTED` | `APP_ENV` compartido exige Supabase para persistencia y auth; perfiles `memory`/`fixture` quedan restringidos a local/test/E2E. |
| Deployment podía quedar “Ready” sin API utilizable | `IMPLEMENTED` | Preflight del perfil descargado y probes post-deploy a `/health/live` y `/health/ready` sobre la URL inmutable. |

## Contrato HTTP — SPEC-215

La API publica un único contrato OpenAPI reproducible y versionado. El quality gate:

1. construye la API;
2. regenera el documento sin levantar un listener;
3. valida metadata, schemas, security, envelopes y Problem Details;
4. falla si el artefacto commiteado tiene drift;
5. compara cambios breaking contra el merge base y exige una excepción versionada cuando
   corresponda.

Los comandos relevantes conservan `/v1`, auth y contexto tenant/branch server-side. Los errores
usan el mismo media type y shape en todos los dominios. CORS no deriva autorización: sólo permite
orígenes exactos configurados.

Comandos de verificación:

```bash
npm run openapi:check
npm run openapi:breaking
npm run openapi:tools:test
npm run runtime:profile:test
```

## Auditoría sensible

Toda ruta HTTP state-changing de Floor, Ordering, Kitchen y Cash debe declarar una policy con
action code, resource type y semántica de resultado. La cobertura se verifica en startup y en
tests; agregar una mutación sin policy falla cerrado.

La evidencia registra tenant, branch permitido, actor, acción, recurso, outcome, reason code,
request ID y correlation ID. Un proyector por allowlist elimina autenticación, secretos, PII,
datos de tarjeta y texto libre; limita profundidad, colecciones, strings y tamaño serializado.

El recorrido MVP-J-001 exige evidencia correlacionada para:

```text
VISIT_OPENED
  → ORDER_SUBMITTED
  → KITCHEN_COMMAND_SERVED
  → PAYMENT_CAPTURED
  → CHECK_SETTLED
  → VISIT_CLOSED
```

Límite vigente: el append auditado bloquea la respuesta exitosa si falla, pero los adapters
PostgREST todavía no ejecutan mutación de negocio, outbox y audit en una única transacción
PostgreSQL. La reconciliación y el unit-of-work atómico siguen siendo deuda de Pilot; consulta el
[runbook de auditoría](audit-runbook.md).

## Observabilidad — SPEC-216

El corte implementado incluye:

- métricas RED y spans HTTP con route templates de baja cardinalidad;
- correlation ID confiable en respuesta, logs, spans y problemas;
- señales de auth, resolución de contexto, readiness y dependencia DB;
- vocabulario y duraciones del recorrido operativo;
- propagación por outbox y deduplicación de observación;
- conteos por estado, evento más antiguo, throughput, retries, failures y leases expirados;
- `GET /v1/operations/outbox-health` protegido y sin payloads;
- métricas de auditoría para append, tamaño de evidencia y policy faltante;
- adapter OTLP configurable y prueba de exportación;
- benchmark sanitizado de overhead, volumen y proyección de consumo.

El quality gate ejecuta:

```bash
npm run test:telemetry:export
npm run observability:evidence
```

ADR-005 mantiene el backend OTLP remoto, dashboards, paging, alertas y SLO/error-budget en
`NOT_OPERATIONAL` para el MVP Demo. Antes de Pilot se requiere backend, región, retención, owner,
canal, baseline de costo/volumen y una alerta sintética entregada end-to-end.

## Runtime durable y delivery

Los ambientes compartidos deben declarar explícitamente:

```text
APP_ENV=preview|development|demo|production
PERSISTENCE_DRIVER=supabase
AUTH_DRIVER=supabase
SUPABASE_URL=<endpoint>
SUPABASE_SECRET_KEY=<credencial server-only>
CORS_ALLOWED_ORIGINS=<orígenes HTTPS exactos separados por coma>
```

El preflight consume el archivo de ambiente descargado por Vercel sin evaluarlo como shell ni
imprimir secretos. La API usa Node `20.19.0` en CI y el proyecto Vercel debe permanecer en Node 20.
Luego del deploy, CI valida liveness y readiness sobre la URL inmutable.

El workflow `End-to-end` es la autoridad de delivery. La Vercel GitHub App no decide si un release
es válido; GitHub Actions despliega selectivamente desde `main` sólo después de `Quality gate` y
`E2E gate`.

## Journey autoritativo — SPEC-222/SPEC-224

MVP-J-001 usa builds reales de Dash, Floor, Kitchen, Cash y API. El escenario:

1. crea marca e invitación de usuario desde Dash;
2. abre una mesa y envía un pedido real desde Floor;
3. procesa la comanda completa desde Kitchen;
4. entrega el pedido y solicita la cuenta;
5. registra y captura un pago manual exacto desde Cash;
6. liquida la cuenta, cierra la visita y libera la mesa;
7. verifica denegación de lectura y escritura desde Tenant B;
8. verifica auditoría correlacionada;
9. confirma que las métricas de Dash vuelven al baseline operativo previo;
10. reinicia la API y vuelve a leer visita, orden, comanda, cuenta, pago, movimiento, mesa y
    auditoría desde PostgreSQL.

El perfil release crea Supabase efímero, aplica migraciones desde cero, usa credenciales y datos
sintéticos namespaced por run, publica evidencia sanitizada y verifica cleanup. `FAILED`,
`INFRA_ERROR`, cleanup incompleto o ausencia de evidencia bloquean el deploy.

## Gates consolidados

El quality/release pipeline cubre:

- formato, lint, tipos y boundaries;
- tests, coverage y presupuestos de bundle;
- SDD/links;
- OpenAPI drift y breaking changes;
- runtime profile y grants;
- secret scan, dependency audit, CodeQL y SBOM;
- exportación/evidencia de telemetría;
- E2E por aplicación;
- MVP-J-001 durable y su lectura después de reinicio;
- deployment selectivo sólo desde `main`.

## Pull requests que materializaron el cierre

| PR | Alcance |
| --- | --- |
| [#58](https://github.com/Adayala/maitre/pull/58) y [#64](https://github.com/Adayala/maitre/pull/64) | Auditoría uniforme y enforcement de mutaciones sensibles. |
| [#59](https://github.com/Adayala/maitre/pull/59) y [#65](https://github.com/Adayala/maitre/pull/65) | Telemetría portable y señales operativas del MVP/outbox. |
| [#60](https://github.com/Adayala/maitre/pull/60) y [#66](https://github.com/Adayala/maitre/pull/66) | Gobernanza OpenAPI, Problem Details, CORS y contratos específicos. |
| [#61](https://github.com/Adayala/maitre/pull/61), [#63](https://github.com/Adayala/maitre/pull/63), [#68](https://github.com/Adayala/maitre/pull/68) y [#72](https://github.com/Adayala/maitre/pull/72) | Harness, recorrido completo, persistencia/restart y baseline operativo. |
| [#62](https://github.com/Adayala/maitre/pull/62) | Superficie real de cobros pendientes requerida por el journey. |
| [#67](https://github.com/Adayala/maitre/pull/67) y [#70](https://github.com/Adayala/maitre/pull/70) | Runtime durable y validación efectiva del deployment. |
| [#69](https://github.com/Adayala/maitre/pull/69) y [#71](https://github.com/Adayala/maitre/pull/71) | Integración post-merge y cierre consolidado de gaps. |

## Trabajo deliberadamente pendiente

El cierre del MVP Demo no resuelve:

- unit-of-work PostgreSQL atómico para business state + outbox + audit;
- assertions exhaustivas de rollback/idempotencia auditada para cada transición;
- backend OTLP remoto, dashboards, alertas, paging y SLO/error-budget;
- promoción staged sin rebuild, previews aisladas y branch protection pendiente de permisos;
- readiness comercial, ASVS, DR, on-call y soporte del MVP Pilot.

Estas limitaciones deben conservarse visibles; ninguna se interpreta como capacidad operativa por
el hecho de existir instrumentación, documentos o adapters.
