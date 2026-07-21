# Especificación — SPEC-216

## 1. Señales

Maitre instrumenta cuatro señales complementarias:

- **logs:** eventos discretos para diagnóstico;
- **métricas:** series agregadas para salud, tendencia y alertas;
- **trazas:** causalidad y latencia entre componentes;
- **eventos de producto/auditoría:** hechos de dominio separados de telemetría técnica.

Ninguna señal sustituye otra. Audit logs y eventos de dominio conservan sus propios contratos, acceso y retención.

## 2. Logging estructurado

Cada entrada es JSON y puede incluir:

- timestamp UTC, severity, service, version y environment;
- message estable y event code;
- traceId, spanId y correlationId;
- route template, método, status, duración y resultado;
- identificadores opacos autorizados de tenant/branch/user;
- error type y stack sólo en destinos server-side permitidos.

Reglas:

- allowlist de campos antes que serialización indiscriminada;
- tokens, cookies, passwords, connection strings, claves, certificados y bodies sensibles se redactan o no se capturan;
- no registrar email, teléfono, documento, tarjeta ni datos fiscales salvo necesidad aprobada y minimizada;
- no usar concatenación que dificulte consultar campos;
- health exitoso se muestrea o excluye para reducir ruido y cuota;
- el logger se inyecta; dominio puro no depende de una biblioteca concreta.

El schema mínimo, event codes I0 y campos prohibidos están en [i0-telemetry-contract.md](i0-telemetry-contract.md). API escribe JSON a stdout/stderr; la plataforma puede capturarlo sin introducir un SDK propietario en application/domain.

## 3. Trazas

- OpenTelemetry instrumenta HTTP, casos de uso y dependencias relevantes.
- Se acepta y propaga `traceparent`; entradas no confiables se validan.
- Spans se nombran por operación estable, nunca por URL con IDs.
- Attributes usan allowlist y evitan PII/secretos.
- Errores se registran en el span sin duplicar payload sensible.
- Sampling es configurable por ambiente y resultado; errores críticos pueden conservarse a mayor tasa.
- Jobs, eventos y webhooks propagan contexto cuando el protocolo lo permite.

## 4. Métricas

Indicadores mínimos:

| Área | Métricas |
| --- | --- |
| HTTP | requests, errores, duración y requests activos |
| Runtime | memoria, CPU/tiempo y cold starts cuando estén disponibles |
| Datos | duración, errores, pool/timeouts y migración vigente |
| Auth | logins exitosos/fallidos, sesión expirada y autorización denegada |
| Idempotencia | hit, conflict, in-progress y recovery |
| Dependencias | latencia, error, timeout, retry y circuit state |
| Producto | éxito/latencia de recorridos críticos, sin PII |

No se usan tenantId, userId, resourceId, URL completa, correlationId o mensaje de error como label de métrica. Esos detalles viven en trazas/logs.

I0 instrumenta únicamente HTTP, readiness, DB/pool cuando exista, Auth verification y `/v1/me/context`. Idempotencia, integraciones y métricas de producto se agregan junto con las specs que las implementan.

## 5. SLI, SLO y error budget

El MVP comienza con objetivos internos, no SLA contractual:

| Recorrido | SLI inicial | Objetivo propuesto |
| --- | --- | --- |
| Health/readiness | responses correctas | 99.5 % mensual |
| Login y contexto | requests válidas exitosas | 99.0 % mensual |
| API interactiva | latencia p95 server-side | < 750 ms |
| Comando crítico | resultados sin duplicación | 100 % |
| Demo | recorridos E2E sintéticos exitosos | 99.0 % en ventana medida |

Estos objetivos son hipótesis `NOT_OPERATIONAL`. Se revisan después de obtener baseline y seleccionar una fuente durable. Ventanas con datos insuficientes se reportan como `NO_DATA`, no como 100 %. Un error budget sólo participa del release gate después de que cálculo, owner y runbook hayan sido verificados.

## 6. Alertas

Una alerta debe ser:

- accionable por una persona concreta;
- basada en impacto o burn rate, no en un evento aislado ruidoso;
- clasificada P1/P2/P3;
- deduplicada y con cooldown;
- enlazada a dashboard, query y runbook;
- probada con una condición sintética segura.

P1 implica pérdida/duplicación monetaria o fiscal, aislamiento de tenant vulnerado, indisponibilidad extensa o corrupción. Alertas de cuota del free tier siguen SPEC-208.

Durante I0 no existe guardia ni canal de paging. Una condición registrada en logs o CI no se llama “alerta operativa”. La activación futura exige owner, canal, horario de cobertura, prueba de entrega y fallback.

## 7. Health y synthetic checks

- `/health/live` indica capacidad del proceso para responder.
- `/health/ready` verifica dependencias esenciales con timeout.
- Health no expone secretos, topología o versiones vulnerables.
- Un synthetic check ejecuta el recorrido mínimo de demo sin modificar datos irreversibles.
- Readiness no sustituye el synthetic: uno mide componentes; el otro, experiencia.

## 8. Fallos y resiliencia

Toda llamada externa declara:

- timeout menor al presupuesto total del request;
- retry sólo para fallos transitorios y operación segura;
- backoff exponencial con jitter y máximo;
- clasificación de dependencia esencial/degradable;
- fallback explícito, nunca datos silenciosamente falsos;
- circuit breaker sólo cuando evidencia operacional justifique su costo.

El frontend distingue offline, timeout, degradación, error recuperable y sesión expirada. No convierte todos los fallos en “Algo salió mal”.

## 9. Incidentes y runbooks

Runbooks mínimos:

- API o Vercel indisponible;
- Supabase/PostgreSQL inaccesible o pausado;
- autenticación degradada;
- cuota próxima al límite;
- secreto expuesto;
- acceso cross-tenant sospechoso;
- duplicación de pago/factura/comando;
- migración fallida;
- restore de base y objetos.

Todo incidente relevante registra timeline, impacto, detección, mitigación, causa, factores contribuyentes y acciones con owner/fecha. El postmortem es blameless pero las acciones son verificables.

## 10. Retención y costo

- Desarrollo y preview usan sampling y retención mínima.
- Demo conserva evidencia suficiente para diagnóstico sin superar cuotas.
- Telemetría detallada se reduce antes de perder señales críticas.
- Exportadores pueden apuntar a consola estructurada, backend OpenTelemetry compatible o proveedor futuro.
- Un cambio de proveedor no modifica instrumentación de dominio/aplicación.

### Baseline I0

- `local/test`: stdout JSON y collector OpenTelemetry local opcional;
- `preview/demo`: stdout JSON capturado por Vercel, sujeto a su retención vigente;
- CI: reports sanitizados con retención mínima;
- no existe exporter SaaS, dashboard durable ni alerta operativa por defecto;
- trazas no se fuerzan a exportarse cuando no hay destino: propagación e instrumentación siguen testeables con exporter in-memory.

Antes de depender de datos históricos se selecciona un backend mediante ADR y presupuesto SPEC-208. La retención limitada se documenta como capacidad ausente, no se compensa aumentando indiscriminadamente el volumen de logs.

## 11. Correlation y confianza

- El servidor genera ULID/UUID opaco cuando falta `X-Correlation-Id`.
- Un valor entrante sólo se conserva si cumple formato/longitud allowlisted; de otro modo se reemplaza.
- `traceparent` se parsea con implementación estándar y nunca se concatena en SQL/HTML.
- `correlationId` vuelve en envelope/problem y response header.
- Identificadores externos son pistas de correlación, no autoridad ni permiso.
