# Plan — SPEC-005

1. Aprobar la semántica exacta de Salon dentro de Branch.
2. Definir unicidad de `name` y eventual `code` por sucursal.
3. Acordar el significado de `capacity` y su relación con Table.
4. Reconciliar migración con FK same-tenant hacia Branch.
5. Definir atributos mínimos de orden/layout.
6. Establecer `SalonRepository` tenant-safe y mapping.
7. Añadir tests de identidad, lifecycle, same-tenant y consistencia con mesas.

Los endpoints HTTP y el comportamiento CRUD se implementan después desde la spec API correspondiente.
