# Reglas — SPEC-001

- **TEN-001:** Tenant es la raíz de aislamiento, no una suscripción.
- **TEN-002:** `id` es global, inmutable y generado por servidor.
- **TEN-003:** toda operación con alcance tenant recibe `tenantId` explícito.
- **TEN-004:** un resource ID nunca autoriza acceso sin Membership y alcance efectivos.
- **TEN-005:** `contactEmail` es contacto opcional; no identifica usuarios ni requiere unicidad global.
- **TEN-006:** Tenant no almacena planes, cuotas, features ni estado de pago.
- **TEN-007:** Tenant no almacena roles, passwords ni listas embebidas de usuarios.
- **TEN-008:** `SUSPENDED` bloquea comandos operativos por defecto.
- **TEN-009:** `ARCHIVED` es terminal y bloquea comandos de negocio.
- **TEN-010:** fechas se generan server-side, usan `timestamptz` y UTC.
- **TEN-011:** el bootstrap puede usar actor `SYSTEM`; no se inventa un User para satisfacer auditoría.
- **TEN-012:** provisioning es autenticado, idempotente y registra `TenantCreated` en outbox.
- **TEN-013:** API camelCase y DB snake_case se conectan sólo mediante repository/mappers.
- **TEN-014:** cambios de defaults no reescriben automáticamente datos históricos.
