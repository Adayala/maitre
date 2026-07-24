# Rules — SPEC-099

- `code` es único dentro de Branch.
- RoutingPolicy se publica por revisión inmutable y debe resolver de forma determinística.
- Empates ambiguos invalidan la publicación de la policy.
- Commands congelan station/revisión/razón al asignarse.
- Inactivar Station requiere cero Commands no terminales o transferencia atómica auditada.
- Station no almacena cola mutable, métricas ni alertas como autoridad.
