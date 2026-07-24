# Estructura — SPEC-137

```text
Invoice
├── scope: tenantId, fiscalEntityId, invoiceId
├── fiscal identity: environment, pointOfSaleId, voucherType, number
├── recipient snapshot
├── line items + totals + currency
├── authorization data: CAE, expiry, provider refs
├── source linkage: check revision
└── normative/audit metadata
```
