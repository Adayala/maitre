# Plan de implementación

1. Separar la resolución customer-scoped de la creación staff y validar el `guestId` contra el tenant activo.
2. Agregar tests API para huésped válido, ausente, inexistente y cross-tenant.
3. Extender Playwright Host para comprobar formulario, checklist, persistencia y nombre mostrado.
4. Ejecutar cobertura focalizada y todos los quality gates obligatorios.
