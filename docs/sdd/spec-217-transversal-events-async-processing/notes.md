# Decisiones — SPEC-217

## Decisiones

- PostgreSQL outbox aprovecha la base ya elegida y evita un servicio pago prematuro.
- At-least-once es una promesa honesta y verificable; exactly-once distribuido no se ofrece.
- Inbox durable se exige para efectos críticos y puede simplificarse en consumidores puramente derivados si la reconstrucción es segura.
- AggregateVersion, no correlationId, representa secuencia.
- Dead-letter es inicialmente un estado/tablas operables, no una cola propietaria.
- Cron/endpoint interno sirve para el volumen inicial; la necesidad de latencia baja o throughput continuo dispara un worker.

## Triggers de migración

- latencia de entrega incompatible con la operación;
- backlog sostenido o cron insuficiente;
- demasiada contención/IO en PostgreSQL;
- fan-out o routing complejo;
- necesidad de consumidores continuos;
- costo de procesamiento mayor que una cola administrada;
- retención/replay que exceda el diseño de outbox.

## Preguntas por dominio

- Retención de inbox/outbox fiscal y de pagos.
- Orden requerido entre Order, KitchenTicket y Check.
- Reconciliación con ARCA y proveedores de pagos.
- Estrategia offline de Floor/Kitchen, que requiere una spec separada.
