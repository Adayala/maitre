# Especificación — SPEC-227

## Screens

- Home / Landing pública
- Menú público
- Sucursales
- Promociones
- Availability discovery (opcional en I0+, si existe la API pública)
- Login / registro de cliente
- Crear reserva autenticada
- Confirmación de reserva

## Flujo principal

1. El cliente entra sin autenticarse.
2. Puede navegar menú, sucursales y promociones visibles.
3. Si intenta reservar, la app lo deriva a autenticación explícita.
4. Tras login exitoso, vuelve al flujo pendiente y crea la reserva.
5. La confirmación muestra sólo datos de su propia reserva.

## Límites de autenticación

- La consulta pública anónima no se modela como `Role`.
- La autenticación del cliente usa el contrato general de identidad, pero con UX y copy separados
  del backoffice.
- No se reutiliza el dashboard admin ni sus rutas para superficies customer-facing.

## Rutas conceptuales

Rutas públicas:

- `/`
- `/menu`
- `/branches`
- `/promotions`
- `/availability`

Rutas autenticadas de cliente:

- `/login`
- `/signup`
- `/reservations/new`
- `/reservations/:id/confirmation`

El path real puede cambiar, pero la separación entre superficies públicas y autenticadas debe
preservarse.

## Estados transversales

Cada screen customer-facing materializa al menos:

```text
LOADING | EMPTY | READY | ERROR
```

Además esta app debe distinguir:

```text
AUTH_REQUIRED | RATE_LIMITED | EXPIRED_LINK
```

`AUTH_REQUIRED` aplica cuando el usuario intenta reservar sin sesión válida. `RATE_LIMITED` y
`EXPIRED_LINK` cubren capabilities públicas de lectura o deep links de campaña.

## Datos visibles sin login

Sin autenticación sólo se muestran datos públicos editoriales u operativos de lectura:

- nombre comercial y branding visible;
- sucursales publicadas;
- horarios y datos de contacto publicados;
- menú y promociones vigentes;
- disponibilidad resumida, sin PII ni detalles internos de capacidad.

No se exponen IDs internos, PII, occupancy en tiempo real, mesas libres nominales, ni estados de
reservas de terceros.

## Reserva autenticada

La creación de reserva autenticada requiere al menos:

- identidad autenticada del cliente;
- branch seleccionado;
- party size;
- ventana horaria;
- consentimientos y canales mínimos si luego se enviarán notificaciones.

La app puede preservar intención previa al login (branch, horario, party size), pero debe
revalidarla server-side tras autenticación antes de crear o confirmar la reserva.

## Continuidad de experiencia

- Un CTA desde menú/sucursal/promoción puede prellenar branch o contexto de reserva.
- El retorno post-login debe volver al flujo que originó la autenticación.
- Fallas de login no deben perder silenciosamente la intención de reserva.

## No alcance

Quedan fuera de este baseline:

- ordering customer-facing completo;
- pagos self-service;
- gestión avanzada de cuenta del cliente;
- wallet, loyalty, referidos o campañas personalizadas;
- chat en vivo o soporte humano integrado.
