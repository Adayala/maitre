# Plan — SPEC-216

## Fase 1 — Fundaciones

1. Aprobar `i0-telemetry-contract.md`, redacción y event codes.
2. Configurar logger JSON y propagación OpenTelemetry con exporter in-memory/local.
3. Instrumentar Fastify, Auth/context y DB cuando esté disponible.
4. Crear filtros/redacción y tests de fuga.

## Fase 2 — Indicadores

1. Instrumentar RED sólo para el walking skeleton y dependencias usadas.
2. Obtener baseline local/preview y marcar `NO_DATA` correctamente.
3. Implementar synthetic check no destructivo de demo.
4. Evaluar si la evidencia justifica un backend gratuito; no declararlo anticipadamente.

## Fase 3 — Operación

1. Definir severidades, owners y rutas de escalamiento cuando exista operación compartida.
2. Seleccionar backend/canal y recién entonces crear alertas verificables.
3. Escribir runbooks mínimos.
4. Ejecutar game days seguros de DB caída, timeout y secreto canario.

## Fase 4 — Gobierno

1. Revisar SLOs con datos reales.
2. Incorporar error budget al gate de release.
3. Medir overhead y costo de telemetría.
4. Documentar postmortem y seguimiento de acciones.
