# Reglas — SPEC-109

- Deny-by-default ante permiso, Membership o assignment/alcance faltante.
- No existen wildcard ni roles locales `kitchen operator` o `expediter`.
- Expediter es assignment de permisos, no rol independiente.
- Overrides, transfers y reprioritization requieren reason y auditoría.
- Revocación o autorización desactualizada invalida acceso mutativo; lectura degradada no la reemplaza.
