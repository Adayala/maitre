# Reglas — SPEC-180

- Es un read model derivado, no ejecuta health checks al leer.
- `UNKNOWN`/`STALE` no equivalen a healthy.
- Redacta provider details sensibles, subjects y secret refs.
- Representa degradación parcial sin colapsarla indebidamente.
- Cache aísla tenant y permisos.
