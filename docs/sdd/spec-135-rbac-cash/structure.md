# Estructura — SPEC-135

```text
Authorization flow
├── authenticate actor
├── resolve permission set + assignments
├── validate tenant/branch/session scope
├── evaluate LimitsPolicy / thresholds
└── enforce segregation + step-up + audit

Profiles / assignments
├── CASHIER
├── MANAGER
├── finance assignment
└── supervisor assignment
```
