# Verificación — SPEC-021

## Criterios

### CAD-021-01 — `POST /v1/users/invitations` deriva tenant del contexto, valida roles/alcances delegables y nunca persiste/devuelve el token de invitación en claro

- [ ] la invitación deriva tenant del contexto autenticado;
- [ ] roles y alcances no delegables fallan;
- [ ] token/link de invitación no aparece en DB de dominio, respuesta, logs o artifacts.

### CAD-021-02 — Reinvitar el mismo email normalizado/tenant con la misma intención no duplica User ni Membership; key con payload distinto produce conflicto

- [ ] invitación nueva, retry idéntico y payload conflictivo producen outcomes contractuales;
- [ ] usuario global existente crea/vincula sólo la Membership autorizada;
- [ ] no se duplican User ni Membership por la misma intención lógica.

### CAD-021-03 — List/get devuelven perfil mínimo y únicamente la Membership del tenant actual, con cursor/filtros estables y PII minimizada

- [ ] list/detail no revelan PII ni memberships de otros tenants;
- [ ] los filtros y el orden son estables;
- [ ] la respuesta minimiza perfil y contexto.

### CAD-021-04 — PATCH exige `If-Match`, no cambia email/identidad externa y modifica sólo perfil permitido o estado/roles/alcances autorizados de Membership

- [ ] PATCH exige ETag o `If-Match`;
- [ ] rechaza mutación de identity/email/tenant;
- [ ] sólo modifica campos permitidos y autorizados.

### CAD-021-05 — Revocación deja de autorizar en el siguiente request; no existe eliminación física de User/Membership mediante esta API

- [ ] revocación bloquea el siguiente request aunque el JWT siga vigente;
- [ ] no existe eliminación física por esta API;
- [ ] la historia y trazabilidad se preservan.

### CAD-021-06 — 401/403/404/409/412/422, auditoría y aislamiento cubren otro tenant, self-escalation, roles no delegables y usuario global preexistente

- [ ] self-escalation, peer escalation y rol no delegable fallan;
- [ ] errores 401/403/404/409/412/422 coinciden con Problem Details;
- [ ] los checks requieren evidencia enlazada y no se completan por mera existencia de código.

### CAD-021-07 — La superficie combinada permite comprender y gestionar accesos

- [ ] `/users` muestra usuarios, estados y perfiles asignados;
- [ ] alta y edición actualizan la lista sin recargar la aplicación;
- [ ] el catálogo contextual explica las capacidades de cada perfil;
- [ ] `/profiles` redirige a `/users`.
