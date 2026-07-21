# Contrato de telemetría I0 — SPEC-216

## Estado de capacidades

| Capacidad | Estado I0 |
| --- | --- |
| logs JSON stdout/stderr | REQUIRED |
| correlation ID | REQUIRED |
| propagación `traceparent` | REQUIRED |
| spans con exporter in-memory/local | REQUIRED para tests |
| métricas RED experimentales | REQUIRED para baseline |
| exporter remoto/SaaS | NOT_SELECTED |
| dashboard durable | NOT_OPERATIONAL |
| alertas/paging | NOT_OPERATIONAL |
| SLO/error-budget gate | NOT_OPERATIONAL |

## Schema de log

```ts
type I0LogEvent = {
  timestamp: string;
  severity: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  service: 'maitre-api';
  environment: 'local' | 'test' | 'preview' | 'development' | 'demo';
  version?: string;
  eventCode: I0EventCode;
  message: string;
  correlationId: string;
  traceId?: string;
  spanId?: string;
  route?: string;
  method?: string;
  statusCode?: number;
  durationMs?: number;
  outcome: 'SUCCESS' | 'FAILURE' | 'DENIED' | 'DEGRADED';
  errorType?: string;
};
```

`route` usa template (`/v1/me/context`), nunca URL completa. `message` es estable y no concatena valores externos. IDs de tenant/user/branch no forman parte del baseline I0; si se justifican después, se agregan como hashes/IDs opacos con privacy review.

## Event codes I0

| Código | Nivel habitual | Cuándo |
| --- | --- | --- |
| `HTTP_REQUEST_COMPLETED` | INFO | request no-health finalizado |
| `HTTP_REQUEST_FAILED` | ERROR | fallo inesperado sanitizado |
| `AUTHENTICATION_DENIED` | WARN | token ausente/inválido/expirado, sin causa enumerativa |
| `AUTHORIZATION_DENIED` | WARN | User/Membership/scope no habilitado |
| `CONTEXT_RESOLVED` | INFO | `/v1/me/context` exitoso, sin listar IDs |
| `DEPENDENCY_UNAVAILABLE` | ERROR | dependencia esencial caída |
| `READINESS_CHANGED` | WARN/INFO | transición ready ↔ not-ready |
| `CONFIGURATION_INVALID` | ERROR | nombre de variable, nunca valor |

Health exitoso no genera `HTTP_REQUEST_COMPLETED` por request. Una transición de readiness sí se registra para evitar ruido.

## Campos prohibidos

- headers completos, query completa o bodies;
- `Authorization`, cookies, access/refresh/reset tokens;
- passwords, secret/service-role keys y connection strings;
- email, teléfono, CUIT, documentos o datos fiscales;
- SQL con parámetros interpolados, stack enviado al cliente;
- nombres de métricas/spans con IDs, emails o mensajes dinámicos.

Los tests usan canarios sintéticos para cada clase y fallan si cualquier representación aparece en logs, spans, reports o errors.

## Métricas I0

| Nombre conceptual | Tipo | Labels allowlisted |
| --- | --- | --- |
| `http.server.requests` | counter | method, route, statusClass, outcome |
| `http.server.duration` | histogram | method, route, statusClass |
| `http.server.active` | up/down counter | service |
| `auth.verification` | counter | outcome, reasonClass |
| `context.resolution` | counter/histogram | outcome |
| `db.operation.duration` | histogram | operation, outcome |
| `readiness` | gauge | component, state |

`reasonClass` usa una allowlist pequeña (`missing`, `malformed`, `expired`, `invalid`, `disabled`) y no refleja mensajes del proveedor.

## Presupuesto y evidencia

- medir p50/p95 de overhead con instrumentación activa versus desactivada;
- registrar bytes/logs por recorrido y volumen estimado demo;
- no fijar límite numérico final sin baseline SPK-05;
- contract tests usan exporter/logger in-memory y no requieren internet;
- artifacts sanitizados incluyen conteos y ejemplos ficticios, nunca dump completo de producción.

## Synthetic I0

El check no destructivo ejecuta:

1. `/health/live`;
2. `/health/ready`;
3. login de usuario sintético sólo en ambiente controlado;
4. `/v1/me/context` y validación de schema;
5. logout/cleanup cuando aplique.

Hasta existir canal/owner, el resultado queda como check CI/manual y no se denomina alerta operativa.
