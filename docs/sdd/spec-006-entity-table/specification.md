# Especificación — SPEC-006

## Definición

Mesa es recurso físico. Su estado se **deriva** de ocupaciones.

## Schema JSON

```json
{
  "id": "uuid",
  "salonId": "uuid",
  "number": "integer | string (ej: 1, T5, VIP-1)",
  "capacity": "integer (cuántas personas caben)",
  "x": "integer (posición en plano)",
  "y": "integer (posición en plano)",
  "shape": "ROUND | RECTANGULAR | SQUARE",
  "status": "DERIVED (AVAILABLE | OCCUPIED | PAYING | CLEANING | BLOCKED)",
  "createdAt": "ISO8601"
}
```

## Rules

- Status NO se almacena, se **calcula** desde:
  - Ocupaciones vigentes → OCCUPIED
  - Reservas confirmadas sin ocupación → RESERVED
  - No hay ocupación ni reserva → AVAILABLE
  - En limpieza → CLEANING
  - Bloqueada manualmente → BLOCKED
