# Especificación — SPEC-086

## Tipo de spec
Entity

## Definición formal
Un ticket/comanda es la instrucción para la cocina (kitchen).
Se crea cuando una orden es confirmada.

Propiedades:
- Items a preparar (del order)
- Estación asignada (grill, pastry, etc)
- Estado: RECEIVED | IN_PROGRESS | READY | SERVED | CANCELLED
- Instrucciones especiales
- Tiempo de preparación

## Schema JSON

```json
{
  "id": "uuid (PK)",
  "order_id": "uuid",
  "visit_id": "uuid",
  "ticket_number": "integer (display en cocina, ej: 42)",
  "station_id": "uuid (estación de cocina)",
  "status": "enum: RECEIVED | IN_PROGRESS | READY | SERVED | CANCELLED",
  "items": [
    {
      "order_item_id": "uuid",
      "product_name": "string",
      "quantity": "integer",
      "modifiers": ["array"],
      "special_instructions": "string | null"
    }
  ],
  "priority": "enum: NORMAL | HIGH | URGENT (rush, cumpleaños, etc)",
  "estimated_time_minutes": "integer | null",
  "started_at": "ISO8601 | null",
  "ready_at": "ISO8601 | null",
  "served_at": "ISO8601 | null",
  "notes": "string | null (comentarios kitchen ↔ waiter)",
  "created_at": "ISO8601",
  "created_by": "uuid (mesero)"
}
```

## Priority Levels

- **NORMAL** — Preparación estándar
- **HIGH** — Prioridad elevada (cliente importante)
- **URGENT** — Urgente (rush order, problema anterior)

## Status Lifecycle

```
RECEIVED (imprime en cocina)
  ↓ (cook acepta)
IN_PROGRESS (está cocinando)
  ↓ (comida lista)
READY (lista para servir, espera mesero)
  ↓ (mesero la entrega)
SERVED (irreversible)

O en cualquier momento:
CANCELLED (si order se cancela)
```

## Validaciones

- ticket_number: único (branch, día, station)
- station_id: debe existir en branch
- items: no vacío
- priority: válido enum

## Reglas e invariantes

### 1. Ticket imprime automáticamente

**Regla:** Cuando Order → CONFIRMED, automáticamente se crea este KitchenTicket y se envía a impresora.

### 2. No se puede modificar después de recibido

**Regla:** status=RECEIVED → read-only (items no se pueden cambiar).

### 3. Priority afecta posición en cola

**Regla:** En cocina, URGENT aparece primero, luego HIGH, luego NORMAL.

### 4. Tiempo estimado es sugerencia

**Regla:** estimated_time_minutes es informativo, puede variar.

Display en cocina muestra "started X min ago" si ya pasó estimated time.
