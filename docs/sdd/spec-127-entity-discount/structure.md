# Estructura — SPEC-127

```text
Discount
├── identity: discountId, version
├── type, scope, eligibility
├── validity window
├── priority, stackingPolicy, caps
└── approval threshold / status

DiscountApplication
├── refs: orderId/checkId, discountId, discountVersion
├── eligibleBase, appliedAmount, currency, taxTreatment
├── actor/capability + reason
└── override approval / compensation linkage
```
