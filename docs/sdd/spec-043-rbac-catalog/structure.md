# Structure — SPEC-043

Middleware checks:
1. Authenticated
2. Resolver Membership/capability pública según endpoint
3. Resolver permission y branch scope
4. Validar draft/published revision y expected version
5. Aplicar regla de dominio y auditar acción sensible

El middleware orquesta; permissions/scopes/revision pertenecen a aplicación/dominio.
