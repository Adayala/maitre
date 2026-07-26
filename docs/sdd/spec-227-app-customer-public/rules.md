# Reglas — SPEC-227

- La navegación pública no exige sesión.
- Reservar exige autenticación previa del cliente.
- Ningún token/capability público de lectura habilita mutaciones.
- La app pública no comparte autoridad RBAC ni navegación con el backoffice.
- Toda respuesta pública aplica minimización de datos y anti-enumeración cuando corresponda.
- Contexto capturado antes del login debe tratarse como sugerencia; el servidor revalida siempre.
