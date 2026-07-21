# Especificación — SPEC-053

## Tipo de spec
Entity

## Definición formal
Un pago es la transacción de efectivo/tarjeta que liquida una cuenta.
Una cuenta puede tener múltiples pagos (parciales).

Propiedades:
- Pertenece a una check
- Método: CASH | CARD | TRANSFER | ELECTRONIC_WALLET
- Estado: PENDING | APPROVED | DECLINED | REFUNDED
- Auditable

## Schema JSON

```json
{
  "id": "uuid (PK)",
  "tenant_id": "uuid",
  "check_id": "uuid",
  "payment_method": "enum: CASH | CARD | TRANSFER | ELECTRONIC_WALLET",
  "amount": "decimal (> 0)",
  "currency": "string (ISO 4217)",
  "status": "enum: PENDING | APPROVED | DECLINED | REFUNDED",
  "reference": "string | null (ej: número de tarjeta, comprobante transferencia)",
  "processor_response": "object | null (respuesta del procesador)",
  "refund_amount": "decimal | null (si está refundado)",
  "refund_reason": "string | null",
  "processed_at": "ISO8601 | null",
  "refunded_at": "ISO8601 | null",
  "created_at": "ISO8601",
  "created_by": "uuid"
}
```

## Status Lifecycle

```
PENDING
  ↓
APPROVED → (opcionalmente) → REFUNDED

O

DECLINED (no hay reintento automático)
```

## Validaciones

- amount: > 0
- payment_method: válido enum
- reference: requerido para CARD y TRANSFER
- refund_amount: null o <= amount

## Reglas e invariantes

### 1. Payment APPROVED es casi inmutable

**Regla:** Un payment APPROVED puede ser refundado, pero no modificado de otro modo.

### 2. Suma de pagos ≥ check.total

**Regla:** SELECT SUM(amount) FROM payments WHERE check_id = ? AND status = 'APPROVED'
  → Debe ser >= check.total

### 3. No puede haber pago sin referencia (CARD/TRANSFER)

**Regla:** Si payment_method IN ('CARD', 'TRANSFER'), reference es requerido.

### 4. Refund no puede exceder amount original

**Regla:** refund_amount <= amount
