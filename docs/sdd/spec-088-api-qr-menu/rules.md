# Rules — SPEC-088

- La capability pública es la única autoridad de acceso; no se aceptan IDs internos del cliente.
- Respuestas inválidas/revocadas/vencidas son uniformes y rate-limited.
- ETag representa el snapshot actual del menú aprobado para I0.
- Payload expone sólo catálogo publicado y metadatos permitidos de lectura.
- `MENU_READ` no se reutiliza para acciones mutativas ni lectura de bill/payment.
