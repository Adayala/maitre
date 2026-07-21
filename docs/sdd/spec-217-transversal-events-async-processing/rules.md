# Reglas — SPEC-217

## Invariantes

1. Estado de negocio y outbox se escriben en la misma transacción.
2. La entrega es at-least-once; todos los consumidores toleran duplicados.
3. Efectos críticos deduplican durablemente, no en memoria.
4. `correlationId` no se usa para garantizar orden.
5. El único orden prometido es por agregado y `aggregateVersion`.
6. Un evento es inmutable, se nombra en pasado y no contiene secretos.
7. Eventos de integración, auditoría y event sourcing permanecen separados.
8. Un mensaje fallido no se descarta después de agotar retries.
9. Replay exige autorización, compatibilidad y trazabilidad.
10. Consumidores no escriben directamente el modelo privado de otro dominio.
11. SDKs de mensajería y Vercel viven detrás de adapters.
12. Un efecto externo incierto se reconcilia antes de repetirlo.

## Prohibiciones

- Publicación directa antes del commit de negocio.
- Dual-write DB + broker sin outbox o garantía equivalente.
- Retries infinitos o intervalos fijos sin jitter.
- Payloads completos “por si acaso”.
- Dependencia de memoria serverless para locks, deduplicación o progreso.
