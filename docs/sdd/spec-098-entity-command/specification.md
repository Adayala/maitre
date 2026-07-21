# Especificación — SPEC-098

## Tipo de spec
Entity

## Definición formal
Un comando es la instrucción centralizada para la cocina.
Es sinónimo de KitchenTicket pero desde perspectiva de cocina.

Propiedades:
- Items a preparar
- Estación
- Estado: RECEIVED | IN_PROGRESS | COMPLETED | CANCELLED
- Prioridad

## Schema JSON

```json
{
  "id": "uuid (PK)",
  "kitchen_ticket_id": "uuid (referencia a comanda)",
  "station_id": "uuid",
  "status": "enum: RECEIVED | IN_PROGRESS | COMPLETED | CANCELLED",
  "priority": "enum: NORMAL | HIGH | URGENT",
  "items_count": "integer",
  "started_at": "ISO8601 | null",
  "completed_at": "ISO8601 | null",
  "created_at": "ISO8601"
}
```

## Status Lifecycle

RECEIVED → IN_PROGRESS → COMPLETED (o CANCELLED)

## Validaciones

- station_id: debe existir
- items_count: >= 1
- priority: válido enum
