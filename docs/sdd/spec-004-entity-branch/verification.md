# Verificación — SPEC-004

## Dominio

- [ ] code se normaliza y valida; duplicado dentro del Tenant falla;
- [ ] el mismo code puede existir en Tenants distintos;
- [ ] timezone inválida y dirección parcial fallan;
- [ ] sólo se permiten transiciones declaradas;
- [ ] `ARCHIVED` no retorna a estados operativos;
- [ ] el agregado no contiene services, features, config genérica ni menu ID.

## Consistencia

- [ ] Brand de otro Tenant falla en aplicación y DB;
- [ ] FiscalEntity de otro Tenant falla en aplicación y DB;
- [ ] cambiar `tenantId` está prohibido;
- [ ] constraints compuestas funcionan en migración y rollback;
- [ ] API camelCase mapea a DB snake_case sin pérdida;
- [ ] timestamps son `timestamptz` y UTC.

## Seguridad

- [ ] User de Tenant A no lista, lee ni modifica Branch de Tenant B;
- [ ] un branch ID conocido no elude Membership/branch scope;
- [ ] Tenant o Branch no operativos bloquean comandos;
- [ ] claims del proveedor no sustituyen autorización ni scope persistido.

## Integración

- [ ] `BranchCreated` y Branch se persisten atómicamente;
- [ ] el cálculo de capacidades consulta Entitlement sin escribirlas en Branch;
- [ ] errores usan Problem Details y correlation ID.

Los checks sólo se completan con evidencia enlazada de tests, migraciones y review.
