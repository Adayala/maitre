# Reglas — SPEC-167

- El nombre canónico es `feedback.feedback.submitted.v1`.
- Se publica sólo al aceptar Feedback.
- Payload omite contenido y credenciales/capabilities sensibles.
- Entrega usa outbox at-least-once con deduplicación.
- Quien necesite contenido debe reconsultar con permisos válidos.
