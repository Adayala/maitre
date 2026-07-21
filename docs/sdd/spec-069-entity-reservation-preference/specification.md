# Especificación — SPEC-069

## Tipo de spec
Entity

## Definición formal
Las preferencias de un guest para reservas.
Es separado de Guest para permitir preferencias específicas por reserva.

Propiedades:
- Preferencia de mesa (tipo)
- Dietas, alergias
- Requerimientos especiales

## Schema JSON

```json
{
  "id": "uuid (PK)",
  "tenant_id": "uuid",
  "reservation_id": "uuid",
  "guest_id": "uuid",
  "preferred_table_type": "enum: WINDOW | BAR | QUIET | OUTDOOR | PRIVATE",
  "dietary_restrictions": ["array: VEGETARIAN, VEGAN, GLUTEN_FREE, etc"],
  "allergies": ["array: NUTS, SHELLFISH, DAIRY, etc"],
  "special_requests": "string (500 chars, ej: 'propuesta matrimonio, sorpresa cumpleaños')",
  "seating_arrangement": "string | null (ej: 'quiero estar de frente al escenario')",
  "accessibility_needs": "string | null (ej: 'necesito silla de ruedas')",
  "high_chair_needed": "boolean",
  "pet_friendly": "boolean",
  "smoking_preference": "enum: YES | NO | DONT_CARE",
  "notes": "string (observaciones del personal)",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

## Validaciones

- allergies: valores válidos en lista permitida
- dietary_restrictions: valores válidos
- special_requests: max 500 chars
- seating_arrangement: max 200 chars

## Reglas e invariantes

### 1. Alergias son críticas para seguridad

**Regla:** Allergies no puede estar vacío si hay restricciones dietarias.

Se propaga automáticamente a Guest.allergies.

### 2. Preferencias se respetan al asignar mesa

**Regla:** Capacitor de disponibilidad respeta table_type preference.

### 3. Accessibility needs bloquean ciertos tipos de mesa

**Regla:** Si accessibility_needs != null, solo se pueden asignar mesas wheelchair_accessible=true.
