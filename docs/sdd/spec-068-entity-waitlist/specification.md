# Especificación — SPEC-068

## Tipo de spec
Entity

## Definición formal
Una entrada en lista de espera cuando no hay mesas disponibles.
Cuando se libera mesa, se notifica al next en queue.

Propiedades:
- Guest, party size
- Fecha/hora deseada
- Posición en cola
- Estado: WAITING | CALLED | CANCELLED | EXPIRED

## Schema JSON

```json
{
  "id": "uuid (PK)",
  "tenant_id": "uuid",
  "branch_id": "uuid",
  "guest_id": "uuid",
  "party_size": "integer (1-50)",
  "desired_time": "HH:MM",
  "desired_date": "ISO8601 date",
  "position": "integer (posición en cola, 1-based)",
  "status": "enum: WAITING | CALLED | CANCELLED | EXPIRED",
  "guest_phone": "string (E.164, para notificación)",
  "guest_email": "string | null",
  "estimated_wait_minutes": "integer | null (estimado)",
  "called_at": "ISO8601 | null (cuando se llamó)",
  "called_by": "uuid | null (userId)",
  "cancelled_at": "ISO8601 | null",
  "expired_at": "ISO8601 | null (si no se presentó)",
  "created_at": "ISO8601",
  "created_by": "uuid"
}
```

## Status Lifecycle

```
WAITING
  ↓ (cuando hay mesa, se llama)
CALLED
  ↓ (cliente se presenta y se convierte en Visit)
CANCELLED (si cancela mientras espera)
EXPIRED (si no se presenta tras 15 min de CALLED)
```

## Validaciones

- party_size: 1-50
- position: >= 1, único (branch, desired_date, desired_time, position)
- guest_phone: E.164 válido
- desired_date: >= HOY

## Reglas e invariantes

### 1. CALLED expira si no se presenta

**Regla:** Si status=CALLED y han pasado 15min sin cambio a Visit, → EXPIRED

**Implementación:** Background job cada 5 min chequea.

### 2. Position actualiza cuando alguien cancela

**Regla:** Si WaitList con position=5 cancela, todos los position>5 decrementan en 1.

### 3. No puede haber 2+ WAITING para misma preferencia

**Regla:** No hay duplicados: (branch, desired_date, desired_time) múltiples veces.

Pero sí puede haber múltiples party_size diferentes.

### 4. Estimated wait se calcula dinámicamente

**Regla:** estimated_wait = (promedio duración visita) * (position - 1)

Recalcular cada vez que hay cambio en queue.
