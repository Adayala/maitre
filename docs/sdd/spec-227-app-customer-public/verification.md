# Verificación — SPEC-227

- Navegación pública disponible sin login.
- Menú/sucursales/promociones no filtran datos internos.
- Intentar reservar sin sesión redirige a `AUTH_REQUIRED`.
- El retorno post-login conserva el intento de reserva o lo recupera explícitamente.
- La creación de reserva falla cerrado si el contexto cambió durante la autenticación.
- Capabilities públicas inválidas/vencidas no filtran existencia de recursos internos.
- La home muestra marca, propuesta y CTA públicos sin formulario de acceso ni KPIs operativos.
- Acceso y reservas propias se presentan en una screen separada.
- Ninguna screen Customer expone `tenant`, RBAC, suscripción o navegación de apps operativas.
- A 320 CSS px la navegación y los CTA primarios conservan orden, legibilidad y targets de 44 px.
