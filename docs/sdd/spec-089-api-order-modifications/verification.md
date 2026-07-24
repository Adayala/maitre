# Verificación — SPEC-089

## Criterios

### CAD-089-01 — La API define comandos y estados de OrderAdjustment con autoridad clara

- [ ] comandos y estados de ajuste son inequívocos y trazables.

### CAD-089-02 — La saga de modificación especifica pasos, terminales y correlación

- [ ] la saga converge a `APPLIED`, `REJECTED` o `COMPENSATION_REQUIRED` aprobados.

### CAD-089-03 — Los estados sensibles requieren controles de excepción explícitos

- [ ] estados sensibles y pagos iniciados requieren excepciones explícitas.

### CAD-089-04 — Idempotencia y revisiones evitan deltas o compensaciones duplicadas

- [ ] idempotencia y retries no duplican cambios ni side effects.

### CAD-089-05 — La modificación no reescribe historial y queda auditada

- [ ] snapshot original e historial permanecen íntegros y auditados.

### CAD-089-06 — La aprobación exige evidencia de compensación, pagos y stale revision

- [ ] fixtures cubren compensación, stale revision, ready/delivered y cross-scope.
