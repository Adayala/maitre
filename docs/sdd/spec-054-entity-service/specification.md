# Especificación — SPEC-054

## Tipo de spec
Entity

## Definición formal
Un tipo de servicio es la configuración de cómo se cobra el servicio (propina).
Ej: "Mesero", "Bartender", "Delivery" con % o monto fijo.

Propiedades:
- Pertenece a una sucursal
- Nombre, descripción
- Tipo: PERCENTAGE | FIXED_AMOUNT
- Valor (% o monto)
- Estado: ACTIVE | ARCHIVED

## Schema JSON

```json
{
  "id": "uuid (PK)",
  "tenant_id": "uuid",
  "branch_id": "uuid",
  "name": "string (ej: 'Mesero 10%')",
  "description": "string | null",
  "service_type": "enum: PERCENTAGE | FIXED_AMOUNT",
  "value": "decimal (% si PERCENTAGE, monto si FIXED_AMOUNT)",
  "is_optional": "boolean (se cobra por defecto o es opcional)",
  "status": "enum: ACTIVE | ARCHIVED",
  "created_at": "ISO8601",
  "created_by": "uuid",
  "updated_at": "ISO8601"
}
```

## Service Type Calculation

- **PERCENTAGE**: service_amount = check.subtotal * (value / 100)
- **FIXED_AMOUNT**: service_amount = value (constante)

## Validaciones

- name: 1-100 chars
- value: > 0
- PERCENTAGE: value entre 0-100
- FIXED_AMOUNT: value positivo razonable

## Reglas e invariantes

### 1. Tipo inmutable después de creación

**Regla:** service_type no puede cambiar.

### 2. Valor debe ser positivo

**Regla:** value > 0 siempre.

### 3. Servicios ACTIVE por defecto

**Regla:** Las nuevas órdenes usan servicios ACTIVE del branch.

### 4. Cambio de servicio no afecta órdenes pasadas

**Regla:** Si se modifica un service, órdenes cerradas mantienen valor histórico.
