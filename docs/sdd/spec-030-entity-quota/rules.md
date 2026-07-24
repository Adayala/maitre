# Rules — SPEC-030

- Una Quota por tenant + usage code + scope + período.
- Used proviene de fuente autoritativa y se reconcilia; no es un contador eventual confiado.
- Admisión revalida/reserva/libera atómicamente antes de confirmar la mutación.
- Límite proviene de Entitlement, no se duplica en Quota.
- Reducción bajo consumo produce `PENDING_REMEDIATION`.
- Lectura tenant es informativa; el servidor conserva autoridad de admisión.
