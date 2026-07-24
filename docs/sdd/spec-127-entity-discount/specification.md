# Especificación — SPEC-127 Discount / DiscountApplication

Discount es política versionada: fixed/percentage, scope, eligibility, vigencia, priority, stacking,
caps y approval threshold. Publicar congela versión; Cashier no puede editar políticas.

DiscountApplication es el hecho aplicado a Order/Check: discount/version, eligible base, amount,
currency, tax treatment, actor/capability, reason y override approval. Orden: exclusiones, priority,
porcentajes, fixed, caps; cada paso redondea sólo según MoneyPolicy compartida. Nunca produce base
negativa. Corrección crea aplicación compensatoria, no reescritura.

Discount conserva `discountId`, `version`, `type`, `scope`, `eligibilityRules`, `validFrom`,
`validUntil?`, `priority`, `stackingPolicy`, `caps`, `approvalThreshold` y `status`. Publicar o
activar congela la versión operativa; un cashier no puede editar políticas ni alterar retrospectivamente
la versión usada por una aplicación histórica.

DiscountApplication referencia `orderId` o `checkId`, `discountId`, `discountVersion`,
`eligibleBase`, `appliedAmount`, `currency`, `taxTreatment`, `actorRef` o capability pública
aprobada, `reasonCode` y `overrideApproval?`. El orden canónico es: exclusiones, priority,
porcentajes, fixed y caps, con redondeo únicamente bajo MoneyPolicy compartida. Si una corrección
es necesaria, se crea una aplicación compensatoria enlazada, nunca una edición destructiva.
