# Especificación — SPEC-006

## Definición formal

Una mesa es una ubicación física en un salón donde se sientan huéspedes.
Cada mesa tiene capacidad, número/nombre, y estado derivado (AVAILABLE, OCCUPIED, RESERVED, PAYING, CLEANING, BLOCKED).

## Schema JSON

```json
{
  "id": "uuid (inmutable, PK)",
  "tenantId": "uuid (aislamiento multi-tenant)",
  "branchId": "uuid (sucursal donde está la mesa)",
  "salonId": "uuid (salón donde está la mesa)",
  "number": "string (1-10 chars, ej: '1', 'A3', 'VIP-1')",
  "name": "string (0-50 chars, ej: 'Mesa cerca ventana') | null",
  "capacity": "integer (1-20, capacidad de personas)",
  "location": {
    "floor": "integer (0 para PB, 1 para 1er piso, etc)",
    "zone": "string | null (ej: 'terraza', 'bar', 'privado')"
  },
  "features": {
    "isWheelchairAccessible": "boolean",
    "hasPowerOutlet": "boolean",
    "isOutdoors": "boolean"
  },
  "shape": "enum: ROUND | RECTANGULAR | SQUARE | IRREGULAR | null",
  "minDurationMinutes": "integer | null (duración mínima de reserva, ej: 90)",
  "createdAt": "ISO8601 timestamp",
  "createdBy": "uuid | null",
  "updatedAt": "ISO8601 timestamp",
  "updatedBy": "uuid | null"
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
- `salonId` — Debe existir y pertenecer a branchId
- `branchId` — Debe existir en el tenant
- `tenantId` — Debe coincidir con tenant de branch
- `minDurationMinutes` — Si se especifica, debe ser >= 30

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
