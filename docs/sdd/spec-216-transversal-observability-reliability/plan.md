# Plan — SPEC-216

## Fase 1 — Fundaciones

1. Definir `TelemetryPort`, logger y catálogo de event codes.
2. Configurar OpenTelemetry y propagación de contexto.
3. Instrumentar Fastify, DB y cliente HTTP.
4. Crear filtros/redacción y tests de fuga.

## Fase 2 — Indicadores

1. Instrumentar métricas RED y dependencias.
2. Definir SLIs y obtener baseline del walking skeleton.
3. Implementar synthetic check de demo.
4. Crear vistas locales/compatibles con free tier.

## Fase 3 — Operación

1. Definir severidades, owners y rutas de escalamiento.
2. Crear alertas de burn rate, errores críticos y cuotas.
3. Escribir runbooks mínimos.
4. Ejecutar game days seguros de DB caída, timeout y secreto canario.

## Fase 4 — Gobierno

1. Revisar SLOs con datos reales.
2. Incorporar error budget al gate de release.
3. Medir overhead y costo de telemetría.
4. Documentar postmortem y seguimiento de acciones.
