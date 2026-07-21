# Plan — SPEC-017

1. Aprobar ADR de identidad y SPEC-020/023 conjuntamente.
2. Crear entity/value objects sin SDK de proveedor.
3. Definir ports de resolución/provisioning de identidad.
4. Crear migración, repository y mapping explícito.
5. Implementar resolución de User desde sesión validada.
6. Implementar suspensión/desactivación y audit.
7. Probar múltiples tenants y proveedor fake.
8. Integrar User mínimo en `/v1/me/context`.

No se implementan password hashing o emisión de JWT dentro de Maitre.
