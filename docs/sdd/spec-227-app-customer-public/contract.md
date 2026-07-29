# Contrato — SPEC-227

La app pública expone únicamente superficies de consulta anónima y flujos customer-facing. No
comparte navegación, estados ni autoridad con la app administrativa.

La home es la portada digital del restaurante: presenta la marca, su propuesta, accesos al menú,
sucursales y reserva. No se comporta como dashboard, onboarding técnico ni selector de contexto.
Los conceptos internos `tenant`, RBAC, servicios suscriptos y estado operativo nunca forman parte
de su lenguaje visible.

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

El formulario de acceso vive en una screen dedicada o aparece como paso contextual al intentar una
acción autenticada. No se incrusta como contenido principal de la home, menú o sucursales.

Esta superficie pertenece exclusivamente a **Maitre Guest / Customer**. Las tareas de salón,
recepción, cocina, caja y administración se resuelven respectivamente en las apps Waiter, Host,
Kitchen, Cashier y Dash, sin mezclar navegación ni componentes operativos en Customer.
