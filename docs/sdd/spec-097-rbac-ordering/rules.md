# Rules — SPEC-097

- Deny-by-default ante permiso, Membership, alcance o assignment faltante.
- No existen wildcard, rol `customer` ni rol `kitchen`.
- Capabilities públicas no se convierten en Membership ni autorizan operaciones internas.
- Cancelación preparada, overrides y reasignaciones requieren motivo y auditoría.
- Revocación o stale auth invalida acceso activo inmediatamente según policy.
