# Rules — SPEC-121

- El cálculo es puro y no muta evidencia ni decide cumplimiento legal final.
- Usa sólo inputs aprobados y append-only adjustments aceptados.
- Aritmética decimal y timezone IANA son obligatorias.
- Exportados previos no se reescriben; reciben delta retroactivo vinculado.
- Sin policy aplicable devuelve `NOT_CONFIGURED`.
- `nightMinutes` es atributo/categoría explicable y puede cruzarse con regular/overtime.
- Rounding y holiday context deben estar versionados o el cálculo queda bloqueado/`NOT_CONFIGURED`.
