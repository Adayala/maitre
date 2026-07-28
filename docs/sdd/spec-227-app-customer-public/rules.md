# Reglas — SPEC-227

- La navegación pública no exige sesión.
- Reservar exige autenticación previa del cliente.
- Ningún token/capability público de lectura habilita mutaciones.
- La app pública no comparte autoridad RBAC ni navegación con el backoffice.
- Toda respuesta pública aplica minimización de datos y anti-enumeración cuando corresponda.
- Contexto capturado antes del login debe tratarse como sugerencia; el servidor revalida siempre.
- La home comunica la propuesta del restaurante y nunca funciona como dashboard de progreso.
- Login, tenant y estado de sesión no ocupan el contenido principal de una screen pública.
- Customer no incorpora controles ni lenguaje propio de Waiter, Host, Kitchen, Cashier o Dash.
