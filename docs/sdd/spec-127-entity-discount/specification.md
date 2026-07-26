# Especificación — SPEC-127 Discount / DiscountApplication

Discount es una política versionada simple: `FIXED` o `PERCENTAGE`, con `scope` libre y vigencia
opcional. Publicar congela la política; luego sólo puede desactivarse.

DiscountApplication es el hecho aplicado a `Order` o `Check`: discount/version, eligible base,
amount, currency, actor y `reasonCode?`. El monto aplicado siempre lo calcula el servidor y nunca
produce base negativa.

Discount conserva `discountId`, `name`, `type`, `value`, `scope`, `validFrom?`, `validUntil?`,
`status` y `revision`. Publicar congela la versión operativa; la aplicación histórica guarda la
`discountVersion` usada.

DiscountApplication referencia `orderId` o `checkId` (exactamente uno), `discountId`,
`discountVersion`, `discountType`, `eligibleBaseMinorUnits`, `appliedAmountMinorUnits`, `currency`,
`actorRef` y `reasonCode?`.

Reglas implementadas:

- `FIXED` usa `value` en minor units;
- `PERCENTAGE` usa basis points (`1000 = 10.00%`);
- `PERCENTAGE` no puede exceder `10000` (100.00%);
- `appliedAmountMinorUnits` se calcula con floor para porcentajes;
- el monto aplicado nunca supera la base elegible ni baja de cero;
- sólo un discount `PUBLISHED` puede aplicarse;
- `evaluate` es read-only y no escribe estado;
- `apply` crea un `DiscountApplication` como traza propia.

No está implementado en I0:

- engine de eligibility rules real;
- priority, stacking, caps o approval threshold;
- tax treatment u override approval;
- compensación/versionado de `DiscountApplication`;
- mutación automática del total de `Order` o `Check` al aplicar el discount.
