# Contrato de dominio — SPEC-018

## Definición

Role es un conjunto estable de permisos asignable a Membership dentro de un Tenant. No es
una credencial, no vive en User y no se acepta como autoridad desde claims editables.

## Catálogo inicial

`OWNER`, `ADMIN`, `MANAGER`, `MAITRE`, `WAITER`, `COOK`, `CASHIER` y `GUEST`. Los códigos
son inmutables y se almacenan en mayúsculas ASCII; etiquetas traducidas son presentación.

`OWNER` es un rol privilegiado y no se concede por invitación común. `GUEST` no habilita
operación interna. Roles funcionales pueden combinarse sólo si la política del dominio lo
permite y siempre respetan branch scope.

## Campos

`code`, `nameKey`, `descriptionKey`, `status`, `permissionCodes`, `assignableBy` y versión
del catálogo. En I0 el catálogo es definido por código/migración versionada, no CRUD libre.

## Invariantes

1. Un Role no contiene tenant, branch ni usuario.
2. Permission codes desconocidos fallan cerrado.
3. Cambiar permisos de un rol es cambio de autorización y requiere review/auditoría.
4. Un actor no delega roles/permisos superiores a los propios.
5. Desactivar un rol no borra assignments históricos y exige migración de memberships.
6. Autorización evalúa permisos efectivos, no nombres visibles de rol.

## Aceptación

- Catálogo determinista y sin códigos duplicados.
- Matrices de SPEC-016/026 y dominios consumidores coinciden.
- Escalación, self-grant y rol desconocido tienen tests negativos.
- Cambios de catálogo son versionados, auditables y reversibles.
