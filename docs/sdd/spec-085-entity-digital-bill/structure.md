# Estructura — SPEC-085

```text
DigitalBill
├── source binding: checkId, checkRevision, asOf
├── capability: token hash, purpose BILL_READ, expiry/revocation
├── public payload: visible lines, totals, balance, status, locale
├── cache policy and freshness metadata
└── privacy redaction boundaries
```

DigitalBill es una representación pública del Check; Invoice fiscal y Payment siguen siendo
autoridades separadas.
