# Contrato de autorización — SPEC-026

## Acciones

| Acción | OWNER | ADMIN | MANAGER | Self |
| --- | --- | --- | --- | --- |
| listar miembros | sí | sí | scope permitido | perfil propio |
| invitar | sí | roles delegables | no por defecto | no |
| cambiar roles/scopes | sí | sólo inferiores/delegables | no | no |
| revocar membership | sí | excepto OWNER/peer protegido | no | salida propia futura |
| cambiar OWNER | workflow explícito | no | no | no |
| editar perfil | según política | según política | no | campos propios permitidos |

## Reglas

1. Tenant se resuelve por contexto y membership activa.
2. Nadie se otorga a sí mismo roles/alcances.
3. Un actor no delega capacidades que no posee.
4. Debe permanecer al menos un OWNER activo por tenant.
5. ADMIN no crea, revoca ni degrada OWNER.
6. El alcance por sucursal sólo puede ser subconjunto del alcance del actor.
7. Revocación y cambios privilegiados usan concurrencia, motivo y auditoría.
8. Claims de Auth no sustituyen roles/permissions autoritativos.

## Aceptación

Matriz positiva/negativa cubre delegación, peer admin, último OWNER, self-grant,
cross-tenant, membership inactiva y sucursal fuera de alcance. Respuestas evitan enumeración y
auditoría conserva actor/target/diff/correlation sin tokens ni PII excesiva.
