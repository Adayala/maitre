# Especificación — SPEC-070

## Tipo de spec
Entity

## Definición formal
La política de cancelación para reservas de un branch.
Define qué tan tarde se puede cancelar sin penalidad.

Propiedades:
- Horas antes de reserva para cancelar sin cargo
- Monto/porcentaje de penalidad
- Excepciones (VIP, etc)

## Schema JSON

```json
{
  "id": "uuid (PK)",
  "tenant_id": "uuid",
  "branch_id": "uuid",
  "name": "string (ej: 'Estándar')",
  "hours_before_reservation": "integer (ej: 24, cuántas horas antes se puede cancelar gratis)",
  "penalty_type": "enum: NONE | PERCENTAGE | FIXED_AMOUNT",
  "penalty_value": "decimal | null (% o monto)",
  "penalty_currency": "string (ISO 4217) | null",
  "applies_to_parties": "integer | null (size >= esto)",
  "status": "enum: ACTIVE | ARCHIVED",
  "created_at": "ISO8601",
  "created_by": "uuid",
  "updated_at": "ISO8601"
}
```

## Examples

### Standard Policy
```json
{
  "name": "Estándar",
  "hours_before_reservation": 24,
  "penalty_type": "PERCENTAGE",
  "penalty_value": 50,
  "applies_to_parties": 1
}
```
→ Cancelación dentro de 24h antes, 50% de penalidad

### VIP Policy
```json
{
  "name": "VIP",
  "hours_before_reservation": 48,
  "penalty_type": "NONE",
  "applies_to_parties": null
}
```
→ Cancelación dentro de 48h, sin penalidad

## Validaciones

- hours_before_reservation: > 0
- penalty_value: null si NONE, otherwise > 0
- penalty_type: valor válido
- applies_to_parties: null o >= 1

## Reglas e invariantes

### 1. Policy aplicable a toda la reserva

**Regla:** Una Reservation usa exactamente 1 CancellationPolicy (del branch).

### 2. Cálculo de penalidad al CANCELLED

**Regla:** Si cancellationTime < (reservationTime - hoursBeforeReservation):
  → penaltyAmount = (reservationPrice * penaltyValue / 100) si PERCENTAGE
  → penaltyAmount = penaltyValue si FIXED_AMOUNT

### 3. Policy ARCHIVED no aplica a nuevas reservas

**Regla:** Solo policies ACTIVE se usan en CREATE Reservation.
