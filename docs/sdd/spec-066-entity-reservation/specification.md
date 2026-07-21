# Especificación — SPEC-066

## Tipo de spec
Entity

## Definición formal
Una reserva es una promesa de asiento para una fecha/hora futura.
Ciclo: PENDING → CONFIRMED → (SEATED | CANCELLED | NOSHOW)

Propiedades:
- Guest name, teléfono, email
- Fecha, hora, cantidad personas
- Puede estar asignada a mesa(s)
- Estado: PENDING | CONFIRMED | SEATED | CANCELLED | NOSHOW
- Políticas de cancelación

## Schema JSON

```json
{
  "id": "uuid (PK)",
  "tenant_id": "uuid",
  "branch_id": "uuid",
  "guest_id": "uuid (referencia al Guest)",
  "reservation_date": "ISO8601 date (ej: 2026-07-25)",
  "reservation_time": "HH:MM (ej: 20:30)",
  "party_size": "integer (1-50, cantidad de personas)",
  "special_requests": "string (500 chars) | null",
  "assigned_table_ids": ["array of uuid"] | null",
  "status": "enum: PENDING | CONFIRMED | SEATED | CANCELLED | NOSHOW",
  "confirmation_number": "string (único, ej: RES-2026-001234)",
  "guest_phone": "string (E.164)",
  "guest_email": "string (email)",
  "cancellation_policy_id": "uuid | null",
  "cancelled_by": "uuid | null (userId, null si no cancelada)",
  "cancellation_reason": "string | null",
  "notes": "string (observaciones internas) | null",
  "created_at": "ISO8601",
  "created_by": "uuid",
  "confirmed_at": "ISO8601 | null",
  "seated_at": "ISO8601 | null",
  "cancelled_at": "ISO8601 | null"
}
```

## Status Lifecycle

```
PENDING
  ↓ (mesero confirma)
CONFIRMED
  ↓ (huésped se sienta)
SEATED (final, vinculado a Visit)

O (en cualquier momento antes de SEATED):
CANCELLED

O (no se presentan):
NOSHOW
```

## Validaciones

- party_size: 1-50
- reservation_date: >= HOY
- reservation_time: HH:MM válido (00:00-23:59)
- confirmation_number: único en tenant
- guest_email: RFC 5322 válido

## Reglas e invariantes

### 1. SEATED vincula a Visit

**Regla:** Cuando status → SEATED, se crea automáticamente Visit.

### 2. Fecha de reserva no puede ser pasada

**Regla:** reservation_date >= CURRENT_DATE

### 3. CANCELLED y NOSHOW son irreversibles

**Regla:** No pueden cambiar a otro status.

### 4. Capacidad >= party_size de mesas asignadas

**Regla:** Si asignadas mesas, sum(capacity) >= party_size

### 5. Email/Teléfono requeridos

**Regla:** Siempre tener guest_email y guest_phone para confirmación.
