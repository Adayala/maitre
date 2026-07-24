# Verificación — SPEC-186

## Criterios

### CAD-186-01 — Permisos quedan separados por lectura/configuración/OAuth/sync/webhooks/tests/auditoría

- [ ] permisos están separados por lectura/configuración/OAuth/sync/webhooks/tests/auditoría.

### CAD-186-02 — No hay roles locales implícitos; todo pasa por assignments canónicos

- [ ] no hay roles locales implícitos; todo pasa por assignments canónicos.

### CAD-186-03 — Ningún permiso del dominio lee secretos directamente

- [ ] ningún permiso lee secretos directamente.

### CAD-186-04 — OAuth, rotation y endpoint changes requieren step-up y segregación

- [ ] OAuth, rotación y endpoint changes requieren step-up/segregación cuando aplica.

### CAD-186-05 — Revocation pausa jobs/sesiones y admins operativos no heredan secretos

- [ ] revocation pausa jobs/sesiones y admins operativos no heredan secretos.

### CAD-186-06 — La aprobación exige evidencia de deny-by-default, step-up y scopes

- [ ] fixtures cubren deny-by-default, step-up, segregación y scopes.
