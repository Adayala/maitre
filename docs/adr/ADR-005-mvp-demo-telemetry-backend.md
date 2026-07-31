# ADR-005 — MVP Demo telemetry backend activation

| Campo                  | Valor                                  |
| ---------------------- | -------------------------------------- |
| **ID**                 | ADR-005                                |
| **Estado**             | ACCEPTED                               |
| **Fecha**              | 2026-07-30                             |
| **Deciders**           | Product owner                          |
| **Specs relacionadas** | SPEC-208, SPEC-216, SPEC-221, SPEC-222 |

## Contexto

Maitre ya instrumenta métricas, trazas y correlación mediante un port portable y un adapter
OpenTelemetry OTLP. El MVP Demo debe conservar costo inicial cero, datos sintéticos y una señal
reproducible del recorrido sin afirmar que existe una operación 24x7, un canal de guardia o un SLO
durable.

Activar un backend remoto sin owner, retención, región, cuota y prueba de entrega convertiría una
integración técnica en una promesa operativa no aprobada.

## Opciones consideradas

- activar inmediatamente un SaaS OTLP y crear dashboards/alertas;
- operar el Demo con logs JSON de Vercel, telemetría in-memory/local y evidencia CI sanitizada;
- desplegar y operar un collector/backend propio.

## Decisión

El MVP Demo no activa un backend OTLP remoto. El gate de release ejecuta el recorrido sintético
autoritativo, exporta evidencia sanitizada y verifica métricas/trazas mediante exporters de prueba.
Vercel conserva logs JSON sólo como diagnóstico de runtime dentro de su retención vigente.

`OTEL_EXPORTER_OTLP_*` permanece disponible pero no configurado en Demo. Dashboards, paging,
alertas y SLO/error budget continúan `NOT_OPERATIONAL`; no bloquean releases ni se presentan como
capacidad del producto.

Antes de MVP Pilot se debe abrir una decisión sucesora con:

- backend, región y retención;
- owner y horario de cobertura;
- canal y fallback;
- baseline de volumen/costo;
- prueba end-to-end de una alerta sintética;
- política de acceso y redacción.

## Consecuencias

### Positivas

- no introduce costo ni dependencia SaaS prematura;
- conserva portabilidad mediante OTLP;
- el recorrido crítico sigue siendo un gate reproducible;
- evita declarar alertas o SLOs sin operación real.

### Negativas

- no existe historia durable de métricas del Demo;
- el diagnóstico entre ejecuciones depende de evidencia CI y retención de plataforma;
- una degradación fuera de una ejecución sintética no genera paging.

## Triggers de revisión

- inicio del gate MVP Pilot;
- datos reales o uso comercial;
- necesidad de medir una ventana temporal durable;
- incidente que no pueda diagnosticarse con logs y evidencia CI;
- requisito contractual de alertas, SLO o residencia de datos.
