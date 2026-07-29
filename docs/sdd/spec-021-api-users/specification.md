# Especificación — SPEC-021

## Endpoints

### `POST /v1/users/invitations`

Ejemplo ilustrativo:

```json
{
  "email": "string",
  "roles": ["WAITER"],
  "branchScope": {
    "mode": "SELECTED_BRANCHES",
    "branchIds": ["branch-id"]
  },
  "locale": "es-AR"
}
```

La respuesta contiene User mínimo y Membership del tenant actual; nunca incluye token/link de
invitación.

### `GET /v1/users`

Lista miembros visibles del tenant con cursor, filtros autorizados y PII minimizada.

### `GET /v1/users/{userId}`

Devuelve perfil mínimo y Membership del contexto actual. No lista memberships de otros tenants.

### `PATCH /v1/users/{userId}`

Requiere `If-Match`. Campos permitidos:

```json
{
  "displayName": "string",
  "membershipStatus": "ACTIVE",
  "roles": ["WAITER"],
  "branchScope": {
    "mode": "SELECTED_BRANCHES",
    "branchIds": ["branch-id"]
  }
}
```

Email, provider/subject y tenants no son mutables mediante este PATCH.

## Superficie de administración

La ruta canónica del backoffice es `/users`, rotulada **Usuarios y perfiles**. Debe mostrar miembros,
estado y perfiles asignados; permitir invitar y editar nombre/estado; e incluir el catálogo de
perfiles y capacidades dentro de la misma pantalla. La antigua ruta `/profiles` redirige a `/users`.

La superficie respeta el límite efectivo `USERS` de la suscripción cuando esté configurado.

## Fuera de alcance

- passwords, MFA, refresh/access tokens o service-role credentials;
- eliminación física;
- modificación de memberships ajenas al tenant actual;
- delegación de roles/capabilities superiores a las del actor.
