# Estructura — SPEC-139

```text
FiscalPrinter
├── scope: tenantId, brandId, branchId, fiscalPrinterId
├── identity: provider, model, deviceId
├── capabilities
├── config secret reference + config version
├── health snapshot
└── status: ACTIVE, DEGRADED, OFFLINE, RETIRED
```
