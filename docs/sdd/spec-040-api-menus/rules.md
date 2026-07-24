# Reglas — SPEC-040

- Toda acción requiere permiso efectivo SPEC-043; etiqueta ADMIN no basta.
- Sólo DRAFT es mutable.
- Publicación valida snapshot y el puntero activo cambia atómicamente.
- PUBLISHED/ARCHIVED son read-only y conservan historia.
- Brand/alcances/Product refs pertenecen al mismo tenant.
- No existe eliminación física.
