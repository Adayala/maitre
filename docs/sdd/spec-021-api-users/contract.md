# Contrato API — SPEC-021

## Alcance

Gestionar perfiles User y su acceso al tenant mediante Membership. La invitación crea o
vincula identidad de forma idempotente; no expone CRUD de credenciales del proveedor.

## Operaciones

| Operación | Semántica |
| --- | --- |
| `POST /v1/users/invitations` | invita email normalizado con roles/scopes permitidos |
| `GET /v1/users` | lista miembros visibles del tenant con cursor/filtros |
| `GET /v1/users/{userId}` | perfil mínimo + membership del tenant actual |
| `PATCH /v1/users/{userId}` | modifica perfil permitido o estado de membership |
| `DELETE /v1/users/{userId}` | no existe como hard delete; usar revoke/deactivate |

## Invitación

Entrada: email, roles, branch scopes y locale opcional. Tenant viene del contexto. Usa
`Idempotency-Key`; reinvitar mismo email/tenant retorna el resultado vigente sin duplicar
User/Membership. Conflictos de roles/scopes devuelven `409/422` sin revelar tenants ajenos.

El token/link de invitación pertenece al proveedor/canal, expira, es one-time y nunca se
persiste en claro ni aparece en responses/logs.

## Lectura y actualización

Respuesta minimiza PII y no lista memberships de otros tenants. Email/identidad externa no
se cambian mediante PATCH común. Revocar membership invalida autorización en el siguiente
request; sesiones/refresh se manejan según SPEC-023.

## Seguridad y errores

SPEC-026 define permisos/delegación. `404` oculta cross-tenant; `409` idempotencia/estado;
`412` concurrencia; `422` role/scope inválido. Mutaciones sensibles auditan actor, target,
tenant, roles/scopes previos/nuevos y correlation ID.

## Aceptación

- Invitación nueva, repetida, vencida y usuario global existente.
- Negativos cross-tenant, self-escalation y rol no delegable.
- Revocación efectiva y datos minimizados.
- OpenAPI, Problem Details, auditoría e idempotencia verificadas.
