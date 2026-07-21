# Contrato — SPEC-038 Category

Category organiza productos dentro de una revisión de Menu. Campos: id, menuRevisionId,
tenantId, name, description opcional, sortOrder, status y auditoría. Nombre normalizado es
único dentro de la revisión; sortOrder produce orden total estable con id como desempate.

Una categoría publicada no se muta in-place. Archivar/ocultar no elimina OrderItems
históricos. Productos no pueden cruzar tenant/menu sin referencia explícita reutilizable
futura. Tests cubren unicidad, reorder concurrente, publicación inmutable y aislamiento.
