# Verificación — SPEC-181

## Criterios

### CAD-181-01 — No existe test genérico; cada adapter declara capabilities y constraints

- [ ] cada adapter declara sus test capabilities y constraints; no existe test genérico.

### CAD-181-02 — Producción restringe tests a health/read-only probados; side effects van a sandbox

- [ ] producción restringe tests a health/read-only probados; side effects van a sandbox.

### CAD-181-03 — Todas las URLs involucradas pasan SSRF policy

- [ ] URLs involucradas pasan SSRF policy.

### CAD-181-04 — El command exige step-up, permiso, idempotencia y auditoría

- [ ] el command exige step-up, permiso, idempotencia y auditoría.

### CAD-181-05 — Resultados normalizan checks/limitaciones sin secrets ni raw responses

- [ ] resultados normalizan checks/limitaciones sin secretos ni raw responses.

### CAD-181-06 — La aprobación exige evidencia de `NOT_SUPPORTED`, sandbox/prod y cleanup

- [ ] fixtures cubren `NOT_SUPPORTED`, sandbox/prod, cleanup, budget y redacción.
