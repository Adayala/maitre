# Rules — SPEC-123

- Policy version debe tener fuente oficial/documentada, vigencia y aprobación competente.
- Tenant overlays sólo endurecen cuando la policy lo permite.
- Findings siempre conservan evidence, occurrence date y rule version.
- El evaluador no sanciona ni toma decisiones humanas finales automáticamente.
- Sin policy aprobada devuelve `NOT_CONFIGURED` y bloquea afirmaciones de compliance.
- La policy aplicable se resuelve por fecha de ocurrencia, no por última versión disponible.
- `NOT_CONFIGURED` conserva captura/evidencia y bloquea sólo la afirmación de cumplimiento.
