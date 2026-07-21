# Contrato de autorización — SPEC-016

## Principio

Autenticación no concede acceso. La API resuelve `User → Membership → roles/scopes` según
SPEC-017/020/023 en cada tenant. Claims del cliente no sustituyen esa autorización.

## Acciones

| Recurso | Acción | OWNER | ADMIN | MANAGER |
| --- | --- | --- | --- | --- |
| Tenant | read/update | sí | read limitado | read limitado |
| Brand | create/read/update | sí | sí | read |
| FiscalEntity | create/read/update | sí | sí | read permitido por scope |
| Branch | create/read/update/status | sí | sí | read por branch scope |
| Salon | create/read/update/status | sí | sí | read por branch scope |
| Table config | create/read/update/status | sí | sí | read por branch scope |
| Membership/admin | delegar | sí | sólo permisos delegables explícitos | no |

`EMPLOYEE` no es una autorización genérica: necesita rol funcional y scope explícito. Un
ADMIN no puede otorgar un permiso que no posee ni crear otro OWNER.

## Enforcement

1. verificar token/identidad;
2. resolver membership activa del tenant autoritativo;
3. evaluar permiso de acción/recurso;
4. evaluar scope de branch cuando aplica;
5. aplicar regla de dominio/cuota;
6. auditar mutaciones y denegaciones sensibles.

La autorización vive en aplicación/dominio y repositorios aplican tenant filters/RLS como
defensa adicional. Ocultar UI no cuenta como control.

## Denegación

Sin autenticación: `401`. Sin permiso: `403`. Para IDs fuera del tenant se usa `404` cuando
evita enumeración. La respuesta no revela existencia, rol requerido ni membership ajena.

## Aceptación

- Matriz positiva y negativa por rol/acción.
- Cross-tenant y branch fuera de scope siempre denegados.
- Membership inactiva/revocada surte efecto sin confiar en claims editables.
- Elevación, self-grant y confused deputy poseen regresiones.
- Auditoría incluye actor, tenant, acción, recurso y correlation ID sin secretos.
