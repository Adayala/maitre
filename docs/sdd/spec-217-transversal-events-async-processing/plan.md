# Plan — SPEC-217

## Fase 1 — Contratos

1. Aprobar envelope y reglas de versionado.
2. Crear schemas Zod y fixtures de compatibilidad.
3. Actualizar specs de eventos prioritarios.
4. Definir `EventPublisherPort` y `JobSchedulerPort`.

## Fase 2 — Durabilidad

1. Crear migraciones de outbox, inbox y leases.
2. Escribir estado + evento en una transacción.
3. Implementar publisher por lotes y recovery de leases.
4. Probar crash antes/después de publicación.

## Fase 3 — Consumo

1. Implementar consumidor idempotente de prueba.
2. Detectar duplicate, stale y gap por aggregateVersion.
3. Implementar retry y dead-letter lógico.
4. Crear replay autorizado y auditable.

## Fase 4 — Operación

1. Integrar scheduler compatible con Vercel/free tier.
2. Instrumentar backlog, age, retry, gap y failure.
3. Crear alertas y runbooks.
4. Probar migración del adapter a un worker local estándar.
