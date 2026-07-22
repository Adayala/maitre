# Especificación — SPEC-127 Discount / DiscountApplication

Discount es política versionada: fixed/percentage, scope, eligibility, vigencia, priority, stacking,
caps y approval threshold. Publicar congela versión; Cashier no puede editar políticas.

DiscountApplication es el hecho aplicado a Order/Check: discount/version, eligible base, amount,
currency, tax treatment, actor/capability, reason y override approval. Orden: exclusiones, priority,
porcentajes, fixed, caps; cada paso redondea sólo según MoneyPolicy compartida. Nunca produce base
negativa. Corrección crea aplicación compensatoria, no reescritura.
