# Especificación — SPEC-217

## 1. Tipos de mensajes

- **Evento de dominio:** hecho interno producido por un agregado; puede permanecer dentro del proceso.
- **Evento de integración:** contrato estable publicado para otros módulos o sistemas.
- **Comando asíncrono:** solicitud dirigida a un consumidor; puede rechazarse y no se nombra en pasado.
- **Audit record:** evidencia de quién hizo qué; posee acceso y retención propios.

Publicar un evento no convierte al sistema en event-sourced. El estado autoritativo continúa en agregados/tablas y se reconstruye desde eventos sólo si una decisión futura lo adopta explícitamente.

## 2. Envelope

```json
{
  "eventId": "01J...",
  "eventName": "OrderSubmitted",
  "eventVersion": 1,
  "occurredAt": "2026-07-21T18:30:00.000Z",
  "producer": "ordering",
  "tenantId": "tenant_...",
  "branchId": "branch_...",
  "aggregateType": "Order",
  "aggregateId": "order_...",
  "aggregateVersion": 7,
  "correlationId": "01J...",
  "causationId": "01J...",
  "traceparent": "00-...",
  "actor": {
    "type": "USER",
    "id": "user_..."
  },
  "payload": {}
}
```

- `eventId`: identidad global opaca e inmutable.
- `eventName`: hecho estable en PascalCase y pasado.
- `eventVersion`: entero mayor a cero; versiona el schema del evento.
- `occurredAt`: instante del hecho, no de su publicación.
- `aggregateVersion`: secuencia monotónica por agregado.
- `correlationId`: agrupa una operación/recorrido; no ordena.
- `causationId`: request, command o event que causó el hecho.
- `actor`: referencia mínima; no replica PII.

## 3. Payload

- Contiene datos suficientes para el consumidor declarado, no snapshots indiscriminados.
- IDs de tenant y agregado del envelope no se contradicen con el payload.
- No contiene tokens, secretos, contraseñas, datos de tarjeta ni certificados.
- PII y datos fiscales se minimizan y clasifican; el consumidor consulta el dato vigente si no necesita una instantánea histórica.
- Fechas, dinero e IDs siguen SPEC-215.
- Un evento describe el hecho ocurrido, no una instrucción futura.

## 4. Transactional outbox

El caso de uso escribe estado de negocio y filas de outbox en la misma transacción PostgreSQL.

La outbox registra como mínimo:

- envelope y payload serializados;
- status `PENDING`, `PROCESSING`, `PUBLISHED` o `FAILED`;
- attempt count, próxima ejecución y timestamps;
- lease owner/expiry para procesamiento concurrente;
- último error sanitizado;
- destino lógico y versión del contrato.

Un publisher reclama lotes pequeños mediante locking seguro, entrega al adapter y actualiza estado. Un lease vencido permite recovery. Marcar `PUBLISHED` no elimina inmediatamente la evidencia necesaria para reconciliación.

## 5. Delivery y deduplicación

La garantía es at-least-once: un consumidor debe aceptar duplicados.

Para efectos críticos, inbox registra `consumerName + eventId`, estado y resultado dentro de la misma transacción que el efecto local. Si el registro ya está completo, devuelve el resultado previo sin repetir el efecto.

La deduplicación temporal de 24 horas no es suficiente para dinero, fiscalidad o efectos externos. La retención se define según la ventana máxima de replay y obligación del dominio.

## 6. Orden

- Sólo se garantiza orden por `aggregateType + aggregateId`.
- `aggregateVersion` aumenta con cada cambio publicado del agregado.
- Un consumidor compara versión esperada, detecta duplicate, stale o gap.
- Un gap se reintenta/reconcilia; no se aplica silenciosamente fuera de orden cuando afecte invariantes.
- No se promete orden global entre agregados, tenants o dominios.
- CorrelationId permite observabilidad, no secuenciamiento.

## 7. Retry y clasificación de fallos

- **transitorio:** timeout, 429, dependencia temporal; retry con backoff exponencial, jitter y límite;
- **permanente:** schema inválido, permiso, recurso incompatible; no repetir ciegamente;
- **desconocido:** conservar evidencia y escalar según criticidad.

El retry respeta `Retry-After`, idempotencia y presupuesto del proceso. El número máximo no se fija universalmente: cada destino declara política, ventana y SLO.

Tras agotar la política, el mensaje queda `FAILED`/dead-letter lógico con causa, payload protegido y runbook. No se descarta. Replay requiere autorización, vuelve a validar compatibilidad y conserva historial de intentos.

## 8. Procesamiento inicial en Vercel

Durante el MVP:

- PostgreSQL outbox es la cola durable;
- un endpoint interno protegido y/o cron reclama lotes acotados;
- cada ejecución respeta timeout y deja leases recuperables;
- requests de usuario pueden disparar publicación best-effort después del commit, pero no dependen de completarla;
- backlog, edad del evento más antiguo, throughput y fallos son métricas obligatorias.

El scheduler se accede por `JobSchedulerPort`. Si frecuencia, latencia, conexiones o volumen exceden Vercel/free tier, el publisher/consumers migran a un worker o cola sin cambiar contratos.

## 9. Contratos y evolución

- Schemas viven en `packages/contracts` y generan tipos/tests.
- Cambios aditivos compatibles conservan `eventVersion` cuando consumidores toleran campos desconocidos.
- Cambios incompatibles crean nueva versión y período de convivencia.
- Productores no eliminan una versión hasta conocer consumidores y completar migración.
- Upcasters pueden adaptar eventos históricos sin alterar el registro original.
- Cada spec de evento declara productor, consumidores, datos, orden, idempotencia, retención y compatibilidad.

## 10. Consumidores e integraciones externas

- Un consumidor ejecuta un caso de uso explícito, no modifica tablas de otro dominio.
- Efectos externos usan su propia idempotency key derivada de intención estable, no sólo del attempt.
- Timeout después de enviar requiere consultar/reconciliar antes de repetir si el proveedor no garantiza idempotencia.
- Webhooks entrantes se autentican, almacenan de forma mínima, deduplican y procesan con el mismo modelo inbox.
- Respuestas exitosas a webhooks se emiten sólo cuando se alcanzó el nivel de durabilidad que su contrato exige.

## 11. Observabilidad y operación

Métricas mínimas:

- outbox pending/processing/failed;
- edad del evento pendiente más antiguo;
- publish/consume duration y throughput;
- retries, duplicates, gaps y dead letters;
- lag por consumidor/destino lógico;
- replay manual y resultado.

Logs/traces incluyen eventId, eventName, version, aggregate y correlation sin payload sensible. Alertas usan edad, backlog, burn rate y criticidad, con runbook según SPEC-216.
