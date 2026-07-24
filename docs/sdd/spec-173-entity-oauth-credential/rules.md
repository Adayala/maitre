# Reglas — SPEC-173

- El dominio nunca guarda tokens ni material secreto.
- Secret refs son opacos y bound a tenant/integration.
- Refresh evita carreras con lease/exclusión.
- Rotación permite overlap controlado y auditable.
- Revocation invalida credenciales y corta jobs dependientes.
