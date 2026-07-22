# Contrato API — SPEC-197 ML Models

Registrar metadatos, evaluar, aprobar, activar, comparar, retirar y hacer rollback de modelos.
Artefactos usan referencias firmadas y validación; activar requiere gates objetivos y actor
autorizado. Tests cubren artefacto corrupto, evaluación fallida, carrera de activación,
rollback, lineage, RBAC y aislamiento.
