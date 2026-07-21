# Especificación — SPEC-100

## Tipo de spec
Entity

## Definición formal
La cola de producción es el estado de tickets pendientes en una estación.
Prioriza por: priority (URGENT/HIGH/NORMAL), luego created_at (FIFO).

Propiedades:
- Tickets en espera, en progreso, listos
- Ordenados por prioridad
- Actualiza en tiempo real

## Schema JSON

```json
{
  "id": "uuid (PK)",
  "station_id": "uuid",
  "tenant_id": "uuid",
  "branch_id": "uuid",
  "tickets": [
    {
      "ticket_id": "uuid",
      "priority": "enum: NORMAL | HIGH | URGENT",
      "status": "enum: QUEUED | IN_PROGRESS | READY",
      "position": "integer (posición en cola, 1-based)",
      "estimated_minutes": "integer",
      "created_at": "ISO8601"
    }
  ],
  "queued_count": "integer (total en espera)",
  "in_progress_count": "integer (en preparación)",
  "ready_count": "integer (listos para servir)",
  "total_tickets": "integer (queued + in_progress + ready)",
  "updated_at": "ISO8601"
}
```

## Queue Ordering

1. Todos los URGENT (sorted by created_at)
2. Todos los HIGH (sorted by created_at)
3. Todos los NORMAL (sorted by created_at)

## Validaciones

- position: >= 1, único en queue
- status: válido enum
- estimated_minutes: > 0

## Reglas e invariantes

### 1. Queue se ordena automáticamente

**Regla:** Cada vez que se agrega ticket o cambia status, la cola se reordena.

No se almacena explícitamente; se calcula desde Command.status.

### 2. Position se asigna automáticamente

**Regla:** Al crear Command → RECEIVED, se asigna position basado en prioridad.

### 3. Position decrece cuando alguien avanza

**Regla:** Si ticket en position=3 → READY, tickets en position 4+ disminuyen en 1.

### 4. Cola visible en cocina (display)

**Regla:** El display de cocina muestra esta queue ordenada, con estimated times.
