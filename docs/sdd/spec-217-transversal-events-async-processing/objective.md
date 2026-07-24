# Objetivo — SPEC-217

Permitir comunicación asíncrona confiable entre dominios e integraciones con una arquitectura que funcione inicialmente sobre PostgreSQL/Vercel y pueda migrar a una cola o broker sin cambiar eventos ni casos de uso.

## Resultados esperados

- Ningún cambio comprometido queda sin evento por una falla entre DB y publicación.
- Una reentrega no duplica pagos, facturas, pedidos o notificaciones.
- Orden y gaps son detectables por agregado.
- Reintentos tienen política, límite, observabilidad y recuperación manual.
- Backlog y cuotas son visibles antes de degradar la operación.
- Contratos evolucionan sin romper consumidores existentes.

## Fuera de alcance

- Adoptar Kafka, RabbitMQ o un SaaS de colas durante el MVP.
- Implementar event sourcing.
- Usar eventos como reemplazo universal de APIs síncronas.
- Garantizar exactly-once distribuido.

## Criterios de aceptación

### CAD-217-01 — Todo cambio comprometido publica hechos mediante outbox recuperable y atómico

Un cambio de negocio confirmado no puede perder su evento por una falla entre base y publicación. Rollback y commit deben dejar resultados inequívocos y recuperables.

### CAD-217-02 — La entrega es at-least-once con consumidores idempotentes y efectos deduplicables

Reentregas, retries y callbacks duplicados no pueden duplicar efectos críticos. La identidad idempotente y la política de inbox/dedupe se gobiernan por contrato.

### CAD-217-03 — El orden sólo se garantiza por agregado y los gaps son detectables

La arquitectura no promete orden global. Cada agregado usa versiones o revisiones que permiten detectar duplicates, stale deliveries y gaps observables.

### CAD-217-04 — Los fallos asíncronos tienen retry, dead-letter, recovery manual y observabilidad explícitos

Timeouts, errores transitorios y permanentes siguen políticas conocidas de retry, backoff, límite y DLQ. Replay y recovery requieren permisos y evidencias.

### CAD-217-05 — Los contratos de evento evolucionan sin romper consumidores existentes

Cambios aditivos deben ser tolerables y cambios incompatibles requieren nueva versión coexistente. Los payloads no exponen secretos ni PII fuera de policy.

### CAD-217-06 — La infraestructura inicial funciona en PostgreSQL/Vercel y conserva portabilidad a un broker futuro

El diseño inicial corre sobre el stack MVP aprobado, pero los casos de uso no quedan acoplados a una plataforma concreta de mensajería. La migración futura no exige reescribir eventos ni dominio.
