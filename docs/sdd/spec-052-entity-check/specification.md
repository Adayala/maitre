# Especificación — SPEC-052 Check

Cuenta comercial autoritativa de Visit, distinta de Invoice. Lines/adjustments congelan OrderItem,
DiscountApplication y tax estimate versions. MVP admite un Check por Visit; split requiere spec
posterior y no se simula.

`gross = sum(lines)`, `netDue = gross - discounts + estimatedTax + serviceCharges`,
`paid = captures - refunds`, `balance = netDue + tipsAppliedToCheck - paid`. Status OPEN,
PAYMENT_PENDING, SETTLED o VOID. SETTLED exige balance=0 y cero Payment ambiguos/pending.

Invoice usa snapshot del Check pero calcula autoridad fiscal. Diferencia permitida sólo por
Money/TaxPolicy de redondeo explícita; otra diferencia genera adjustment antes de autorizar. Rechazo
ARCA no reabre ni cambia Check automáticamente.
