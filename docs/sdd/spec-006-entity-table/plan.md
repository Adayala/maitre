# Plan — SPEC-006

1. Aprobar el agregado Table y su separación respecto de reservas, ocupaciones y bloqueos.
2. Definir scope de unicidad de `number` y semántica de layout.
3. Declarar la precedencia exacta de estados derivados.
4. Reconciliar migración con relaciones same-tenant hacia Branch y Salon.
5. Definir Table y value objects puros, incluyendo override administrativo acotado.
6. Definir repositorio tenant-safe y proyección de estado derivado.
7. Añadir tests de unicidad, precedencia, same-tenant y Tenant A/B.

Los endpoints HTTP se implementan después desde la spec API correspondiente.
