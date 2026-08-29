# Plan de implementación

1. Incorporar en `org-explorer-model.ts` una función pura que resuelva la selección de sucursal al expandir un grupo y preserve la selección al contraerlo.
2. Cubrir todos sus branches en `org-explorer-model.test.ts`: expansión con selección nula, misma rama, descendiente de otra rama y contracción.
3. Usar esa decisión en los toggles y botones de grupos de `BranchTreeNode`, navegando antes de iniciar la carga lazy de una rama.
4. Extender `tests/e2e/apps/dash/hierarchical-navigation.spec.ts` con la regresión de GitHub #102 y comprobar que desaparecen las acciones del salón anterior.
5. Ejecutar unit tests con cobertura, Playwright Dash, format, lint, typecheck y los gates generales exigidos por el repositorio.
6. Registrar artefactos y evidencia en Agora; sólo satisfacer criterios y avanzar el work item cuando los gates estén verdes.
