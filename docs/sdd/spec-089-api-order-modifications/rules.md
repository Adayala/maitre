# Rules — SPEC-089

- Post-submit sólo se modifica mediante comandos tipados; no existe patch arbitrario del snapshot.
- Cada comando requiere idempotencia/correlación y revisión esperada.
- Cambios con impacto productivo o de pago aplican policy de excepción explícita.
- Compensaciones son visibles y auditadas; una falla parcial no se oculta como éxito completo.
- Snapshot original e ítems históricos no se sobrescriben.
