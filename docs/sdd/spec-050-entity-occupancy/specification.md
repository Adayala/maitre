# Especificación — SPEC-050

## Tipo de spec
Entity

## Definición formal
Ocupación en tiempo real de una mesa. Es el vínculo "vivo" entre mesa y visita actual.
Se actualiza continuamente mientras hay una visita OPEN.

Propiedades:
- Pertenece a una mesa (table_id) y visita (visit_id)
- Timestamps de entrada/salida de huéspedes
- Puede tener múltiples huéspedes por asiento

## Schema JSON

```json
{
  "id": "uuid (PK)",
  "tenant_id": "uuid",
  "branch_id": "uuid",
  "table_id": "uuid (mesa ocupada)",
  "visit_id": "uuid (visita actual)",
  "occupied_at": "ISO8601 timestamp (entrada)",
  "vacated_at": "ISO8601 timestamp | null (salida)",
  "guest_count": "integer (huéspedes en ESTA mesa)",
  "is_active": "boolean (true si occupied_at > vacated_at)",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

## Validaciones

- table_id + visit_id: único (una occupancy por tabla por visita)
- guest_count: 1-table.capacity
- vacated_at: solo si is_active = false
- occupied_at < vacated_at (si ambos presentes)

## Reglas e invariantes

### 1. Una mesa = máximo 1 occupancy activa

**Regla:** No puede haber 2+ occupancy con is_active=true para la misma mesa.

### 2. Vacated implica ocupación anterior

**Regla:** Si vacated_at es null, es_active=true. Si vacated_at existe, is_active=false.

### 3. Occupancy activa = mesa OCCUPIED

**Regla:** Si existe occupancy activa, el status de mesa debe ser OCCUPIED.

### 4. Guest count ≤ capacidad mesa

**Regla:** guest_count <= table.capacity siempre.
