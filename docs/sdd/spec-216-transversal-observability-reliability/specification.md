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

## 5. SLI, SLO y error budget

El MVP comienza con objetivos internos, no SLA contractual:

| Recorrido | SLI inicial | Objetivo propuesto |
| --- | --- | --- |
| Health/readiness | responses correctas | 99.5 % mensual |
| Login y contexto | requests válidas exitosas | 99.0 % mensual |
| API interactiva | latencia p95 server-side | < 750 ms |
| Comando crítico | resultados sin duplicación | 100 % |
| Demo | recorridos E2E sintéticos exitosos | 99.0 % en ventana medida |

Los objetivos se revisan después de obtener baseline. Ventanas con datos insuficientes se reportan como tales, no como 100 %. El consumo acelerado del error budget detiene releases de riesgo y prioriza confiabilidad.

## 6. Alertas

Una alerta debe ser:

- accionable por una persona concreta;
- basada en impacto o burn rate, no en un evento aislado ruidoso;
- clasificada P1/P2/P3;
- deduplicada y con cooldown;
- enlazada a dashboard, query y runbook;
- probada con una condición sintética segura.

P1 implica pérdida/duplicación monetaria o fiscal, aislamiento de tenant vulnerado, indisponibilidad extensa o corrupción. Alertas de cuota del free tier siguen SPEC-208.

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
