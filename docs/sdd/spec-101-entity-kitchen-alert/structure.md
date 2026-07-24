# Estructura — SPEC-101

```text
KitchenAlert
├── scope: tenantId, brandId, branchId, subject refs
├── rule metadata: ruleId, ruleVersion, threshold, severity, evidence window
├── fingerprint + activation identity
├── lifecycle: OPEN, ACKNOWLEDGED, RESOLVED + escalation metadata
└── evidence/audit history
```

KitchenAlert es señal operativa derivada. Command y Station siguen siendo las autoridades
operativas primarias.
