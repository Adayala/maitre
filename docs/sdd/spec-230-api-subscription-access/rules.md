# Rules — SPEC-230

- La fuente de verdad es `subscription_items` persistido, no `PLAN_REGISTRY`.
- Sólo `status=ACTIVE` concede visibilidad.
- La cantidad se devuelve sin reinterpretación y siempre es positiva.
- Un ítem de otra sucursal nunca concede acceso.
- Una suscripción inexistente responde `404`.
- La respuesta no reemplaza autorización RBAC; subscription gating y permisos se aplican juntos.
