# Contrato API — SPEC-164 External Reviews

Listar y obtener reseñas normalizadas, y ejecutar acknowledge/assign/resolve sin mutar el
contenido de origen. Los filtros incluyen plataforma, ubicación, período, rating y estado;
cursores garantizan paginación estable. La respuesta conserva provenance y freshness. Tests
cubren edición o borrado remoto, duplicados, contenido inseguro, proveedor caído, RBAC,
retención, términos de uso y aislamiento entre tenants.
