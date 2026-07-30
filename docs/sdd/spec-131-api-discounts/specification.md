# Especificación — SPEC-131 Discounts API

El objetivo completo contempla CRUD de DRAFT, publish/version/deactivate, evaluate y command
`apply`. Sólo roles de policy pueden publicar; operadores aplican versiones ya publicadas.
Evaluate es explicable y no reserva uso.

## Surface materializado en I0

- create/list/detail de `Discount`;
- publish y deactivate;
- evaluate read-only con cálculo server-side;
- apply que revalida que la policy esté publicada y crea `DiscountApplication`;
- aislamiento tenant, RBAC y auditoría de la aplicación.

En I0, apply recibe la base elegible pero nunca confía en el monto aplicado aportado por el cliente.
La application conserva policy/version, base, monto calculado, moneda, actor y target.

## Target posterior a I0

El surface incluye create/list/detail/update sólo sobre borradores, más comandos explícitos
`publish`, `version`, `deactivate`, `evaluate` y `apply`. No existe edición destructiva de una
versión publicada; cualquier cambio material genera nueva versión o desactivación controlada.

`evaluate` devuelve desglose explicable de elegibilidad, exclusiones, stacking, caps y límites sin
reservar uso ni mutar estado. `apply` revalida `Order` o `Check` revision, usage limits, vigencia,
timezone, caps y stacking dentro de una sola transacción, creando `DiscountApplication`,
actualizando el total dependiente y publicando outbox consistente.

Si el actor usa override, la API exige permission separada, reason y approval threshold según
policy. Importes, bases elegibles o montos netos aportados por el cliente se ignoran o rechazan;
el cálculo vive íntegramente del lado del servidor.

Este target avanzado no está materializado todavía. Requiere congelar `MoneyPolicy`, eligibility,
stacking, caps, usage, versionado/compensación de `DiscountApplication`, concurrencia con
`Order`/`Check` y eventos transaccionales. Hasta entonces apply no muta automáticamente el total
dependiente.
