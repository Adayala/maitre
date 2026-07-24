# Rules — SPEC-103

- `code` es único por Branch y se valida en escritura autoritativa.
- Actualizaciones usan `If-Match` o expected revision.
- `publish-routing` rechaza rules ambiguas o destinos inactivos/incompatibles.
- `deactivate` requiere cola autoritativa vacía o plan de transferencia atómico.
- No se borra Station con historia operativa.
