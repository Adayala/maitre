# Especificación — SPEC-049

## Tipo de spec
Entity

## Definición formal
Una visita (sesión de comensales en una mesa) desde que se sientan hasta que se van.
Ciclo: OPEN → (SERVED) → PAYING → CLOSED

Propiedades:
- Pertenece a un tenant, sucursal, mesa
- Puede estar vinculada a una reserva
- Tiene huéspedes (count + optional primaryGuest)
- Tiene múltiples mesas (pueden mover huéspedes)
- Estado: OPEN | SERVED | PAYING | CLOSED
- Auditable

## Schema JSON

```json
{
  "id": "uuid (PK, inmutable)",
  "tenant_id": "uuid",
  "branch_id": "uuid",
  "salon_id": "uuid",
  "table_ids": ["array of uuid (mesas ocupadas)"],
  "reservation_id": "uuid | null (si viene de reserva)",
  "primary_guest_id": "uuid | null (huésped principal del grupo)",
  "guest_count": "integer (1-50, cantidad de personas)",
  "status": "enum: OPEN | SERVED | PAYING | CLOSED",
  "opened_at": "ISO8601 timestamp",
  "seated_at": "ISO8601 timestamp | null (cuando se sentaron)",
  "served_at": "ISO8601 timestamp | null (cuando se sirvió comida)",
  "payment_requested_at": "ISO8601 timestamp | null",
  "closed_at": "ISO8601 timestamp | null",
  "estimated_duration_minutes": "integer | null (hint para maître)",
  "notes": "string (200 chars) | null (observaciones)",
  "created_at": "ISO8601",
  "created_by": "uuid"
}
```

## Status Lifecycle

```
OPEN
  ↓ (cuando se sirve comida)
SERVED
  ↓ (cuando piden cuenta)
PAYING
  ↓ (cuando se efectúa pago)
CLOSED (irreversible)
```

## Validaciones

- guest_count: 1-50
- table_ids: no vacío, todas pertenecen a mismo salon_id
- status: solo transiciones válidas
- reservation_id: si existe, debe pertenecer a esta fecha
- closed_at: solo si status = CLOSED

## Reglas e invariantes

### 1. Una visita ocupa 1+ mesas

**Regla:** Una visita OPEN tiene 1+ mesas. No puede haber visita sin mesa.

### 2. Mesas no pueden estar ocupadas por 2+ visitas simultáneamente

**Regla:** Cada table_id puede estar en max 1 visit OPEN a la vez.

### 3. Visita CLOSED es inmutable

**Regla:** Una visita CLOSED no puede modificarse (campos no-updatable).

Permite: lectura, auditoría, reportes.

### 4. Transición a PAYING requiere órdenes completadas

**Regla:** No se puede transicionar a PAYING si hay órdenes PENDING.

### 5. Guest count debe ser coherente

**Regla:** guest_count >= 1 y <= max_table_capacity (suma capacidades)
