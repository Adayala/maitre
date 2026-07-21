# Especificación — SPEC-006

## Tipo de spec

Entity

## Definición formal

Una mesa es una ubicación física en un salón donde se sientan huéspedes.
Cada mesa tiene capacidad, número/nombre, y estado derivado (AVAILABLE, OCCUPIED, RESERVED, PAYING, CLEANING, BLOCKED).

## Schema JSON

```json
{
  "id": "uuid (inmutable, PK)",
  "tenant_id": "uuid (aislamiento multi-tenant)",
  "branch_id": "uuid (sucursal donde está la mesa)",
  "salon_id": "uuid (salón donde está la mesa)",
  "number": "string (1-10 chars, ej: '1', 'A3', 'VIP-1')",
  "name": "string (0-50 chars, ej: 'Mesa cerca ventana') | null",
  "capacity": "integer (1-20, capacidad de personas)",
  "location": {
    "floor": "integer (0 para PB, 1 para 1er piso, etc)",
    "zone": "string | null (ej: 'terraza', 'bar', 'privado')"
  },
  "features": {
    "is_wheelchair_accessible": "boolean",
    "has_power_outlet": "boolean",
    "is_outdoors": "boolean"
  },
  "shape": "enum: ROUND | RECTANGULAR | SQUARE | IRREGULAR | null",
  "min_duration_minutes": "integer | null (duración mínima de reserva, ej: 90)",
  "created_at": "ISO8601 timestamp",
  "created_by": "uuid",
  "updated_at": "ISO8601 timestamp",
  "updated_by": "uuid"
}
```

## Status (DERIVED - calculated, not stored)

Status se calcula en tiempo real:
- **AVAILABLE** — No hay visita, no hay reserva, lista para nuevos huéspedes
- **OCCUPIED** — Hay una visita OPEN en progreso
- **RESERVED** — Hay una reserva futura confirmada
- **PAYING** — Hay una visita en estado PAYING
- **CLEANING** — Mesa marcada como en limpieza
- **BLOCKED** — Mesa bloqueada administrativamente

## Validaciones

- `number` — 1-10 chars, único en salon
- `capacity` — Entre 1 y 20 personas
- `salon_id` — Debe existir y pertenecer a branch_id
- `branch_id` — Debe existir en el tenant
- `tenant_id` — Debe coincidir con tenant de branch
- `min_duration_minutes` — Si se especifica, debe ser >= 30

## Reglas e invariantes

### 1. Número único por salón
No pueden existir dos mesas en un salón con el mismo número.
Índice único (tenant_id, salon_id, number).

### 2. Capacidad coherente
La capacidad de la mesa debe ser ≤ capacidad máxima del salón.

### 3. Estado derivado (NO almacenado)
El status se calcula en cada lectura desde:
- Visitas abiertas → OCCUPIED
- Reservas futuras → RESERVED
- Bloques administrativos → BLOCKED
- Estado de limpieza → CLEANING
- Default → AVAILABLE

### 4. No se puede reservar mesa BLOCKED
Si mesa está BLOCKED, no se pueden crear reservas ni visitas.

### 5. Capacidad mínima 1
Una mesa debe tener capacity >= 1 y capacity <= 20.
