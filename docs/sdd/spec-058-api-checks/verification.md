# Verificación — SPEC-058

## Criterios

### CAD-058-01 — La API de Check delimita rutas, comandos y precondiciones inequívocas

- [ ] OpenAPI contiene sólo rutas/comandos aprobados y permisos completos.

### CAD-058-02 — Las mutaciones de Check son idempotentes y revisadas por servidor

- [ ] retries convergen;
- [ ] revisiones desactualizadas y totales enviados se rechazan.

### CAD-058-03 — La respuesta expone el desglose monetario con política explícita

- [ ] líneas, descuentos, tax, cargos, tip, captura y refund reproducen SPEC-052.

### CAD-058-04 — Settlement y void validan dependencias sin efectos parciales

- [ ] SETTLED/VOID y ajustes concurrentes respetan revisión y atomicidad.

### CAD-058-05 — Los ajustes preservan append-only y frontera fiscal separada

- [ ] redacción, append-only y rechazo fiscal preservan las fronteras.

### CAD-058-06 — La aprobación exige evidencia monetaria, de RBAC y aislamiento

- [ ] RBAC, Problem Details, auditoría, outbox y aislamiento fallan cerrado.
