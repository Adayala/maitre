# Especificación — SPEC-085

## Tipo de spec
Entity

## Definición formal
Una cuenta digital que el huésped ve en su dispositivo (tablet/QR).
Permite ver consumo en tiempo real, solicitar más items, pagar.

Propiedades:
- Vinculada a una visita
- Actualiza en tiempo real con nuevas órdenes
- Permite feedback/ratings
- Se genera automáticamente con Visit

## Schema JSON

```json
{
  "id": "uuid (PK)",
  "visit_id": "uuid",
  "session_token": "string (token para acceder via QR)",
  "status": "enum: ACTIVE | PAYMENT_REQUESTED | PAID | CANCELLED",
  "subtotal": "decimal",
  "discounts": [
    {
      "description": "string",
      "amount": "decimal"
    }
  ],
  "tax_amount": "decimal",
  "service_charge": "decimal | null",
  "total": "decimal",
  "items": [
    {
      "order_item_id": "uuid",
      "product_name": "string",
      "quantity": "integer",
      "unit_price": "decimal",
      "line_total": "decimal"
    }
  ],
  "payment_methods_available": ["CARD", "CASH", "TRANSFER"],
  "language": "string (ISO 639-1)",
  "created_at": "ISO8601",
  "last_updated_at": "ISO8601",
  "paid_at": "ISO8601 | null"
}
```

## Validaciones

- session_token: único, long string
- total: coherente (subtotal - discounts + tax + service)
- language: ISO 639-1 válido

## Reglas e invariantes

### 1. Digital Bill se crea automáticamente con Visit

**Regla:** Cuando Visit.status → OPEN, se crea automáticamente DigitalBill.

### 2. Se actualiza en tiempo real

**Regla:** Cada vez que se confirma nueva Order, DigitalBill se actualiza automáticamente.

### 3. Session token expira

**Regla:** Tras 6 horas de inactividad o después que Visit → CLOSED, token se invalida.

### 4. No se puede pagar si hay órdenes PENDING

**Regla:** status no puede transicionar a PAYMENT_REQUESTED si hay orders PENDING.
