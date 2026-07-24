# Estructura — SPEC-124

```text
CashRegister
├── scope: tenantId, brandId, branchId, cashRegisterId
├── identity: code, displayName
├── allowedCurrencies
└── status/config metadata

CashSession
├── refs: cashRegisterId, currency
├── businessDate + timezone
├── opening/cutoff/close metadata
├── ledgerRevision
├── status + suspended flag
└── late adjustments linkage
```
