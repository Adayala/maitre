# Especificación — SPEC-052

## Tipo de spec
Entity

## Definición formal
Una cuenta/recibo (bill) es el resumen de consumo y pagos de una visita.
Una visita puede tener múltiples cuentas si se divide.

Propiedades:
- Pertenece a una visita
- Tiene items (órdenes)
- Puede tener descuentos
- Tiene total antes/después impuestos
- Estado: OPEN | PENDING_PAYMENT | PAID | CANCELLED

## Schema JSON

```json
{
  "id": "uuid (PK)",
  "tenant_id": "uuid",
  "visit_id": "uuid",
  "check_number": "integer (secuencial por branch/día)",
  "status": "enum: OPEN | PENDING_PAYMENT | PAID | CANCELLED",
  "subtotal": "decimal (suma items antes descuentos)",
  "discount_amount": "decimal (descuentos aplicados)",
  "discount_reason": "string | null (motivo del descuento)",
  "tax_amount": "decimal (impuestos calculados)",
  "total": "decimal (subtotal - descuentos + impuestos)",
  "currency": "string (ISO 4217, ej: ARS)",
  "items": [
    {
      "order_item_id": "uuid",
      "quantity": "integer",
      "unit_price": "decimal",
      "line_total": "decimal"
    }
  ],
  "opened_at": "ISO8601",
  "paid_at": "ISO8601 | null",
  "cancelled_at": "ISO8601 | null",
  "notes": "string | null",
  "created_at": "ISO8601"
}
```

## Status Lifecycle

```
OPEN
  ↓ (cuando se pide la cuenta)
PENDING_PAYMENT
  ↓ (cuando se procesa pago)
PAID (irreversible)

O

CANCELLED (irreversible)
```

## Validaciones

- check_number: único (tenant_id, branch_id, date)
- total: subtotal - descuentos + tax >= 0
- items: no vacío
- tax_amount: debe calcularse según régimen fiscal

## Reglas e invariantes

### 1. Check PAID es inmutable

**Regla:** Una check PAID no puede modificarse.

### 2. Total debe ser coherente

**Regla:** total = (subtotal - discount_amount + tax_amount)

### 3. No puede haber check sin items

**Regla:** Un check debe tener >= 1 item.

### 4. Descuento no puede ser negativo

**Regla:** discount_amount >= 0
