# Reglas — SPEC-098

- Existe uno por allocation lógica + station routing revision; no se recicla.
- `READY` termina producción; `COMPLETED` confirma handoff y no son equivalentes.
- No existe estado `FAILED`; errores técnicos viven en attempts/retries.
- Payload sólo admite campos allowlisted por tipo y versión, con tamaño máximo aprobado.
- Toda transición requiere expected revision e idempotency key/correlation adecuada.
- PII, precios, datos fiscales y blobs quedan fuera del contrato.
