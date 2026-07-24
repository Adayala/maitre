# Verificación — SPEC-046

## Criterios

### CAD-046-01 — `GET /v1/dashboard/setup-status` deriva tenant/alcance server-side y exige permiso de setup read

- [ ] el endpoint deriva tenant/alcance server-side;
- [ ] exige permiso de setup read;
- [ ] permiso/alcance/cross-tenant filtran sin enumeración.

### CAD-046-02 — Cada item usa code estable, `COMPLETE | INCOMPLETE | BLOCKED`, reason codes, evidence refs mínimas y action link allowlisted

- [ ] cada item usa code/status/reason codes estables;
- [ ] evidence refs mínimas siguen contrato;
- [ ] action refs no permiten URL arbitraria.

### CAD-046-03 — Estado se calcula desde autoridades de Tenant/FiscalEntity/Branch/Salon/Table/Menu/Membership y no desde clicks, porcentaje o cache cliente

- [ ] empty/partial/complete se derivan de autoridades correctas;
- [ ] no se calcula desde clicks o porcentaje cliente;
- [ ] la cache cliente no decide el estado.

### CAD-046-04 — Desconfigurar una dependencia hace regresar el item de forma determinista y no conserva COMPLETE stale

- [ ] desconfigurar dependencia revierte status;
- [ ] COMPLETE stale no se conserva;
- [ ] la regresión sigue criterio determinista.

### CAD-046-05 — ETag/revision/freshness hacen visible cache/staleness; una dependencia unavailable no se presenta como INCOMPLETE confirmado

- [ ] unavailable no se presenta como incomplete/zero;
- [ ] ETag/revision cambia sólo con input semántico;
- [ ] cache stale se etiqueta y no amplía acciones.

### CAD-046-06 — Empty/partial/complete/regression, permisos y cross-tenant poseen resultados verificables sin PII ni conteos innecesarios

- [ ] empty/partial/complete/regression poseen resultados verificables;
- [ ] permisos y cross-tenant siguen contrato;
- [ ] no expone PII ni conteos innecesarios.
