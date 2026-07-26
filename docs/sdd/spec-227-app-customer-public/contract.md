# Contrato — SPEC-227

La app pública expone únicamente superficies de consulta anónima y flujos customer-facing. No
comparte navegación, estados ni autoridad con la app administrativa.

Sin login se permite:

- ver menú publicado;
- ver sucursales públicas y datos editoriales visibles;
- ver promociones públicas vigentes;
- iniciar consulta de disponibilidad resumida si la surface pública existe.

Con login obligatorio se permite:

- crear una reserva;
- consultar o gestionar reservas propias si ese surface se materializa;
- ejecutar cualquier acción que persista identidad, consentimiento o comunicación del cliente.

La app pública no recibe permisos RBAC internos. Toda transición a acciones autenticadas deriva a
los contratos de identidad y reservas aplicables. Un token público de lectura nunca otorga
capacidad de mutación por sí solo.
