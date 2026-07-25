# Verificación — SPEC-058

## Criterios

### CAD-058-01 — La API de Check delimita rutas, comandos y precondiciones inequívocas

- [ ] OpenAPI contiene sólo rutas/comandos materializados y permisos completos;
- [ ] create/get por visit y get por check quedan definidos.

### CAD-058-02 — Las mutaciones de Check son idempotentes y revisadas por servidor

- [ ] totales enviados por cliente se rechazan;
- [ ] la spec distingue claramente endurecimientos diferidos de idempotencia/revisión.

### CAD-058-03 — La respuesta expone el desglose monetario con política explícita

- [ ] líneas, descuentos, tax, cargos y balance reproducen SPEC-052;
- [ ] el resumen de pagos queda redactado como `paymentsSummary`.

### CAD-058-04 — Settlement y void validan dependencias sin efectos parciales

- [ ] SETTLED/VOID validan lifecycle y saldo;
- [ ] concurrencia fuerte por revisión puede endurecerse después si aún no está materializada.

### CAD-058-05 — Los ajustes preservan append-only y frontera fiscal separada

- [ ] redacción, append-only y rechazo fiscal preservan las fronteras.

### CAD-058-06 — La aprobación exige evidencia monetaria, de RBAC y aislamiento

- [ ] RBAC, Problem Details y aislamiento fallan cerrado;
- [ ] auditoría/outbox y revisión fuerte quedan explicitadas según estado materializado.
