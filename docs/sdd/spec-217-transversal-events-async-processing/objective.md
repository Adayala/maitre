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
