# Especificación — SPEC-082

## Tipo de spec
Entity

## Definición formal
Un item es un producto individual dentro de una orden.
Almacena precio snapshot, cantidad, modificaciones.

Propiedades:
- Producto (con precio snapshot)
- Cantidad
- Precio unitario (snapshot al momento)
- Modificadores (customizaciones)
- Instrucciones especiales

## Schema JSON

```json
{
  "id": "uuid (PK)",
  "order_id": "uuid",
  "product_id": "uuid",
  "quantity": "integer (1-100)",
  "unit_price": "decimal (snapshot al crear)",
  "line_subtotal": "decimal (quantity * unit_price)",
  "modifiers": [
    {
      "modifier_id": "uuid",
      "name": "string (ej: 'Sin cebolla')",
      "price": "decimal (adicional)"
    }
  ],
  "special_instructions": "string (500 chars) | null (ej: 'Al punto, extra salsa')",
  "notes_from_kitchen": "string | null (respuesta cocina, ej: 'No hay XXX')",
  "created_at": "ISO8601"
}
```

## Validaciones

- quantity: 1-100
- unit_price: > 0
- modifiers: array de modificadores válidos
- special_instructions: max 500 chars

## Reglas e invariantes

### 1. Precio snapshot inmutable

**Regla:** unit_price es snapshot del producto al crear item.

Si later cambia el precio del producto, este item mantiene su unit_price.

### 2. No se puede tener quantity = 0

**Regla:** quantity >= 1

### 3. Modificadores solo de este producto

**Regla:** Los modifiers deben pertenecer al product_id de este item.

### 4. Line subtotal es calculada

**Regla:** line_subtotal = quantity * (unit_price + sum(modifier prices))

No se almacena, se calcula en cada lectura.
