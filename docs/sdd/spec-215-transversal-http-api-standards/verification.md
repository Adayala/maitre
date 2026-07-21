# Verificación — SPEC-215

## Contratos

- [ ] OpenAPI se regenera sin drift desde schemas ejecutables.
- [ ] Cada endpoint documenta éxito, problemas, auth y contexto.
- [ ] Un cambio breaking no aprobado falla CI.
- [ ] Ejemplos y fixtures contienen sólo datos sintéticos.

## Seguridad y tenancy

- [ ] Token ausente/inválido devuelve 401 sin filtrar causa sensible.
- [ ] Falta de permiso devuelve 403 o 404 según política de no revelación.
- [ ] Tenant o branch manipulados no amplían acceso.
- [ ] CORS y límites varían sólo mediante config validada.
- [ ] Logs, problemas y OpenAPI no incluyen secretos.

## Idempotencia y concurrencia

- [ ] Replay con misma key/payload devuelve el resultado original.
- [ ] Misma key con payload distinto devuelve 409.
- [ ] Requests concurrentes no duplican el efecto.
- [ ] Fallo después de efecto externo puede recuperarse sin repetirlo.
- [ ] `If-Match` obsoleto no sobrescribe cambios críticos.

## Compatibilidad y resiliencia

- [ ] Cliente tolera campos adicionales en responses.
- [ ] Cursor conserva orden estable y no mezcla filtros.
- [ ] Timeouts abortan trabajo del cliente y liberan recursos del servidor cuando sea posible.
- [ ] Retry respeta `Retry-After`, backoff, jitter y máximo.
- [ ] Correlation/trace conecta request, logs y error entregado al cliente.
