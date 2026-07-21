# Rules — SPEC-023

- **AUTH-001:** Maitre no almacena, recibe ni valida passwords.
- **AUTH-002:** un access token sólo prueba identidad; roles, tenants, branches y entitlements se resuelven server-side.
- **AUTH-003:** issuer, audience y algoritmos permitidos son configuración explícita por ambiente.
- **AUTH-004:** una verificación incompleta o una dependencia de claves no confiable falla cerrado.
- **AUTH-005:** `(provider, subject)` identifica de forma única a un User; email no se usa como permiso.
- **AUTH-006:** no se crea ni vincula un User implícitamente durante autenticación.
- **AUTH-007:** User y Membership deben estar activos para autorizar operaciones tenant-scoped.
- **AUTH-008:** redirects de reset y verificación pertenecen a una allowlist exacta por ambiente.
- **AUTH-009:** tokens, passwords, códigos, cookies y secrets nunca aparecen completos en logs, métricas, traces o errores.
- **AUTH-010:** el browser nunca recibe credenciales administrativas o service-role.
- **AUTH-011:** errores públicos evitan enumeración de cuentas.
- **AUTH-012:** la lógica de aplicación depende del puerto, no del SDK de Supabase.
- **AUTH-013:** toda ruta protegida rechaza por defecto la ausencia de contexto autenticado.
- **AUTH-014:** claims de metadata editables por el cliente nunca conceden autorización.
