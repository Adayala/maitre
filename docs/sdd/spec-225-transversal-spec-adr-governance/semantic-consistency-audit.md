# Auditoría de consistencia semántica

La terminología organizacional queda consolidada por el
[contrato Tenant–Brand–Branch](../spec-001-entity-tenant/organization-hierarchy-contract.md):
Tenant es el cliente/frontera de aislamiento, Brand es la marca comercial y Branch es la sucursal.

**Fecha:** 2026-07-22

## Checks ejecutados

- nombres de eventos deprecados;
- roles locales/genéricos y jerarquías ordinales;
- frases de autoridad contradictorias sobre capacidad/proyecciones;
- lifecycles antiguos de Visit, Invoice, TimeEntry y Payment;
- conceptos duales Product/Menu, Check/Invoice, KitchenTicket/KDS y Shift/ServicePeriod.

## Resultado

No quedan coincidencias de las contradicciones de autoridad buscadas:

- “capacity calculation evita double allocation”;
- cancelación que libera capacidad sólo mediante proyección;
- KitchenTicket definido simultáneamente como proyección/comando;
- Visit `OPEN | PAYING | CLOSED` como lifecycle autoritativo;
- Invoice AUTHORIZED cancelable;
- TimeEntry/Break `ADJUSTED` ocultando el original.

Los nombres `PaymentProcessed`, `CheckGenerated`, `OrderPlaced`, `CashRegistered` e
`InvoiceGenerated` sólo permanecen en contratos que los declaran explícitamente legados/no
publicables. Su presencia textual es permitida mientras esté acompañada por el reemplazo normativo;
no debe convertirse en event type, schema ID o consumer nuevo.

## Normalización RBAC aplicada

SPEC-012, 016, 026, 036 y 043 dejaron de autorizar por `EMPLOYEE`, “all authenticated” o jerarquía
`OWNER > ADMIN > ...`. Las decisiones usan Permission + Membership + tenant/branch/data scope y
deny-by-default. Menciones de `employee` como Employment/employee code o de Payroll como dominio no
son roles locales.

Las expresiones `host`, `customer`, `kitchen operator`, `expediter`, `supervisor`, `finance`,
`payroll`, `reputation analyst`, `integration admin`, `tenant admin`, `analyst` y `ML admin` sólo
pueden aparecer para declarar que son assignments/aliases no canónicos. El validador debe revisar
contexto o mantener allowlist de frases de deprecación para evitar falsos positivos.

## Gate propuesto

1. Prohibir event type/schema nuevo con nombre legado.
2. Prohibir matrices RBAC con columnas de rol no canónico fuera del catálogo SPEC-018.
3. Prohibir comparación ordinal de roles en código/contratos.
4. Permitir nombres legados únicamente en sección de migration/deprecation con successor.
5. Ejecutar contract tests de Permission + scope + revocation por API.

Esta auditoría verifica texto/consistencia documental; no constituye evidencia de implementación ni
promueve readiness.
