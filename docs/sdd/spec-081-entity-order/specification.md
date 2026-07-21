# Especificación — SPEC-081

## Tipo de spec
Entity

## Definición formal
Una orden es la solicitud de comida/bebida de una visita.
Contiene items (productos), modificaciones, estado.

Propiedades:
- Pertenece a una visita
- Contiene 1+ items
- Estado: PENDING | CONFIRMED | PREPARED | DELIVERED | CANCELLED
- Se puede modificar hasta confirmación
- Vinculada a Comanda (kitchen ticket)

## Schema JSON

```json
{
  "id": "uuid (PK)",
  "tenant_id": "uuid",
  "branch_id": "uuid",
  "visit_id": "uuid",
  "table_id": "uuid",
  "order_number": "integer (secuencial por branch/día)",
  "status": "enum: PENDING | CONFIRMED | PREPARED | DELIVERED | CANCELLED",
  "items": [
    {
      "order_item_id": "uuid",
      "product_id": "uuid",
      "quantity": "integer",
      "unit_price": "decimal",
      "line_total": "decimal",
      "modifiers": ["array of modifier_ids"],
      "special_instructions": "string | null"
    }
  ],
  "subtotal": "decimal (suma items)",
  "discount_amount": "decimal",
  "tax_amount": "decimal",
  "total": "decimal",
  "sent_to_kitchen_at": "ISO8601 | null",
  "ready_at": "ISO8601 | null",
  "delivered_at": "ISO8601 | null",
  "created_at": "ISO8601",
  "created_by": "uuid"
}
```

## Status Lifecycle

```
PENDING (recién creada, se puede editar)
  ↓ (mesero confirma y envía a cocina)
CONFIRMED
  ↓ (cocina prepara)
PREPARED (lista para entregar)
  ↓ (mesero entrega)
DELIVERED (irreversible)

O en cualquier momento antes de DELIVERED:
CANCELLED
```

## Validaciones

- items: no vacío
- total: coherente (subtotal - discount + tax)
- order_number: único (tenant, branch, date)
- special_instructions: max 500 chars

## Reglas e invariantes

### 1. No se puede modificar después de CONFIRMED

**Regla:** status=CONFIRMED, PREPARED, DELIVERED, CANCELLED → read-only

### 2. Items no pueden estar vacíos

**Regla:** items.length >= 1 siempre

### 3. Total debe ser coherente

**Regla:** total = (subtotal - discount_amount + tax_amount)

### 4. PENDING → CONFIRMED crea Comanda

**Regla:** Al transicionar a CONFIRMED, se crea automáticamente Command en Kitchen.

### 5. Orden CANCELLED no genera comanda

**Regla:** Si se cancela en PENDING, no se crea Command.
