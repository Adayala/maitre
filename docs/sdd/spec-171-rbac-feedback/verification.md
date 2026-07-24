# Verificación — SPEC-171

## Criterios

### CAD-171-01 — Permisos quedan separados por submit, caso, contenido, PII, análisis y conectores

- [ ] permisos están separados por submit, caso, contenido, PII, export, análisis y conectores.

### CAD-171-02 — `GUEST` usa sólo capability pública y no existen roles locales implícitos

- [ ] `GUEST` usa sólo capability pública y no existe rol local implícito para customers/staff.

### CAD-171-03 — Assignments operativos respetan branch y purpose sin acceso global

- [ ] assignments operativos respetan branch/purpose scope.

### CAD-171-04 — Texto y PII se deniegan por default; export exige step-up y auditoría

- [ ] texto y PII se deniegan por default; export exige step-up y auditoría.

### CAD-171-05 — Administrar modelos o conectores no implica leer contenido o PII

- [ ] admin de modelos/conectores no implica lectura de contenido/PII.

### CAD-171-06 — La aprobación exige evidencia de deny-by-default, scopes y separación de privilegios

- [ ] fixtures cubren deny-by-default, scopes, step-up y separación de privilegios.
