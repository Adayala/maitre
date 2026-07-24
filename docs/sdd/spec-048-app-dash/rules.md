# Rules — SPEC-048

- Autenticación no equivale a autorización; cada API reevalúa permission/scope.
- No existe restricción global OWNER/ADMIN: rutas/acciones se filtran por capabilities.
- UI no confía en tenant/branch selector sin contexto validado.
- Ocultar/deshabilitar controles no es security boundary.
- Acciones sensibles muestran outcome/correlation y backend produce AuditLog según policy.
- PII/secrets/tokens se minimizan en state, storage, logs y analytics.
- Accesibilidad/responsive/error states son requisitos, no polish posterior.
