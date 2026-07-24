# Objetivo — SPEC-021

## Propósito

Gestionar invitaciones, perfiles mínimos y Memberships dentro del tenant autenticado sin exponer
credenciales, tenants ajenos ni convertir User global en autoridad de acceso.

## Criterios de aceptación

### CAD-021-01 — `POST /v1/users/invitations` deriva tenant del contexto y nunca expone el token en claro

`POST /v1/users/invitations` deriva tenant del contexto, valida roles/alcances delegables y nunca
persiste/devuelve el token de invitación en claro.

### CAD-021-02 — Reinvitar el mismo email y tenant con la misma intención no duplica User ni Membership

Reinvitar el mismo email normalizado/tenant con la misma intención no duplica User ni Membership; key
con payload distinto produce conflicto.

### CAD-021-03 — List y get devuelven perfil mínimo y sólo la Membership del tenant actual

List/get devuelven perfil mínimo y únicamente la Membership del tenant actual, con cursor/filtros
estables y PII minimizada.

### CAD-021-04 — PATCH exige `If-Match` y no cambia email ni identidad externa

PATCH exige `If-Match`, no cambia email/identidad externa y modifica sólo perfil permitido o
estado/roles/alcances autorizados de Membership.

### CAD-021-05 — Revocación deja de autorizar en el siguiente request y no existe hard delete

Revocación deja de autorizar en el siguiente request; no existe hard delete de User/Membership
mediante esta API.

### CAD-021-06 — Estados HTTP, auditoría y aislamiento cubren otro tenant, self-escalation y roles no delegables

401/403/404/409/412/422, auditoría y aislamiento cubren acceso a otro tenant, self-escalation, roles no
delegables y usuario global preexistente.
