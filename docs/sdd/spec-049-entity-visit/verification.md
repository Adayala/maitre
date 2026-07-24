# Verificación — SPEC-049

## Criterios

### CAD-049-01 — Visit mantiene identidad operativa y contexto de atención coherentes

- [ ] apertura válida y rechazos cross-tenant/cross-Branch.

### CAD-049-02 — El ciclo autoritativo de Visit queda acotado y sin ambigüedades

- [ ] matriz completa de transiciones válidas e inválidas.

### CAD-049-03 — Los estados derivados no se persisten como autoridad independiente

- [ ] ausencia de writes para estados derivados.

### CAD-049-04 — La asignación de mesas se delega en Occupancy y evita solapamientos inválidos

- [ ] doble seating y movimientos concurrentes convergen sin solapamiento.

### CAD-049-05 — El cierre valida dependencias operativas y publica efectos de forma atómica

- [ ] cada blocker de cierre aborta sin efectos parciales;
- [ ] éxito y outbox comparten atomicidad.

### CAD-049-06 — La aprobación exige evidencia operativa, concurrente y auditable suficiente

- [ ] reintentos idempotentes, conflictos de revisión, capacidad y workflow correctivo
      producen evidencia auditable.
