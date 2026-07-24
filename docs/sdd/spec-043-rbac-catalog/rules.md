# Reglas — SPEC-043

- La lectura publicada no concede lectura/escritura draft.
- Price, tax, publish, archive y media requieren permisos separados.
- No existe `EMPLOYEE` genérico ni jerarquía ordinal de roles.
- GUEST accede mediante capability limitada y no elige tenant/alcance.
- Cross-tenant/draft leakage y self-escalation fallan cerrado.
