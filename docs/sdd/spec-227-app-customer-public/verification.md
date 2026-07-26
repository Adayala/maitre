# Verificación — SPEC-227

- Navegación pública disponible sin login.
- Menú/sucursales/promociones no filtran datos internos.
- Intentar reservar sin sesión redirige a `AUTH_REQUIRED`.
- El retorno post-login conserva el intento de reserva o lo recupera explícitamente.
- La creación de reserva falla cerrado si el contexto cambió durante la autenticación.
- Capabilities públicas inválidas/vencidas no filtran existencia de recursos internos.
