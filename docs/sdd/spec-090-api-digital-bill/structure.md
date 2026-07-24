# Estructura — SPEC-090

```text
GET /public/bills/{token}
├── validate BILL_READ capability
├── resolve current DigitalBill projection
├── return checkRevision, asOf, totals, balance, status
├── apply privacy redaction
└── emit restrictive cache/freshness metadata
```
