# Estructura — SPEC-144

```text
/invoices
├── POST create draft
├── GET list
└── /{invoiceId}
    ├── GET detail
    ├── :validate
    ├── :issue
    ├── :reconcile
    ├── :credit
    ├── :debit
    └── :void-draft
```
