# Contrato de entidad — SPEC-127 Discount

El contrato implementado hoy cubre dos artefactos:

- `Discount`
- `DiscountApplication`

`Discount` incluye:

- `id`, `tenantId`, `name`
- `type` (`FIXED` | `PERCENTAGE`)
- `value`
- `scope`
- `validFrom?`, `validUntil?`
- `status` (`DRAFT` | `PUBLISHED` | `DEACTIVATED`)
- `revision`, `createdAt`, `updatedAt`

`DiscountApplication` incluye:

- `id`, `tenantId`
- `discountId`, `discountVersion`, `discountType`
- `eligibleBaseMinorUnits`, `appliedAmountMinorUnits`, `currency`
- `actorRef`, `reasonCode?`
- `orderId?`, `checkId?` (exactamente uno)
- `createdAt`

El contrato actual garantiza:

- valor positivo entero para descuentos;
- porcentaje acotado a 100.00%;
- transición `DRAFT -> PUBLISHED -> DEACTIVATED` (o `DRAFT -> DEACTIVATED`);
- cálculo server-side del monto aplicado;
- aplicación sólo de discounts `PUBLISHED`;
- preservación de la versión publicada usada por cada application;
- una application como registro propio, sin editar ni borrar el policy histórico.

No forman parte del contrato I0 stacking, caps, priority, approval thresholds, tax treatment, ni
la mutación automática del total de order/check.
