# Reglas — SPEC-172

- Integration es tenant-scoped y versionada.
- Ownership matrix define autoridad/campo; no hay defaults implícitos.
- Last-write-wins no es política por defecto.
- Upgrade y disable son auditados y preservan historia.
- Disable revoca operación futura sin borrar evidencia pasada.
