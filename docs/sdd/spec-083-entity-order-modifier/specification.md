# Especificación — SPEC-083

## Tipo de spec
Entity

## Definición formal
Un modificador es una customización aplicable a un producto.
Ej: tamaño (S/M/L), punto de cocción, sin ingrediente, etc.

Propiedades:
- Pertenece a un producto
- Nombre, precio adicional (si aplica)
- Puede tener opciones (small/medium/large)
- Estado: ACTIVE | ARCHIVED

## Schema JSON

```json
{
  "id": "uuid (PK)",
  "product_id": "uuid",
  "name": "string (ej: 'Tamaño', 'Punto de cocción')",
  "modifier_type": "enum: SIZE | COOKING | ADDON | EXCLUSION | CUSTOM",
  "price_adjustment": "decimal (adicional, puede ser 0)",
  "is_required": "boolean (es obligatorio elegir)",
  "options": [
    {
      "option_id": "uuid",
      "name": "string (ej: 'Pequeño', 'Mediano', 'Grande')",
      "price": "decimal (override de price_adjustment)"
    }
  ],
  "status": "enum: ACTIVE | ARCHIVED",
  "created_at": "ISO8601"
}
```

## Modifier Types

- **SIZE** — Tamaño (small/medium/large)
- **COOKING** — Punto (rare/medium/well-done)
- **ADDON** — Adicionales (extra queso, salsa, etc)
- **EXCLUSION** — Exclusiones (sin cebolla, sin picante)
- **CUSTOM** — Texto libre (observación especial)

## Validaciones

- name: 1-50 chars
- price_adjustment: >= 0
- options: nombre único dentro del modifier
- is_required: boolean

## Reglas e invariantes

### 1. Modificadores inmutables después de usar

**Regla:** Si un OrderItem ya usa este modifier, no se puede archivar sin migrar items.

### 2. Modificadores ARCHIVED no disponibles para nuevas órdenes

**Regla:** Solo ACTIVE modifiers aparecen en menú.

### 3. Precio nunca negativo

**Regla:** price_adjustment >= 0 (no puede ser descuento)

### 4. REQUIRED implica al menos 1 opción

**Regla:** Si is_required=true, debe haber >= 1 option.
