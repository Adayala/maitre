# Reglas — SPEC-055

- Tenant y actor derivan de autenticación; Branch es parámetro de ruta validado contra el
  scope autorizado y nunca se acepta duplicado en el body.
- Status cambia sólo por command idempotente con `If-Match`.
- Create más seating inicial es atómico; cambios posteriores usan SPEC-056 y Occupancy.
- List usa cursor estable, límites máximos y filtros allowlisted.
- Cross-tenant responde `404`; conflicto `409`; revisión `412`; transición `422`.
