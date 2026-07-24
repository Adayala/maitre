# Rules — SPEC-029

- Una proyección efectiva por tenant + code + scope + calculation revision.
- Valores tipados distinguen LIMITED, UNLIMITED, DENIED y otros tipos de catálogo.
- Ausencia, fuente inválida o cache stale no amplían capacidad.
- Override es una fuente separada con autoridad, razón y expiry; no CRUD del Entitlement.
- Recomputation es idempotente, auditable y reemplaza atómicamente.
- Toda admisión usa Entitlement efectivo y, si es cuantitativo, Quota autoritativa.
