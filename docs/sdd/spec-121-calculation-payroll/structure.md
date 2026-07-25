# Estructura — SPEC-121

```text
PayrollProjectionInput
├── approved time intervals
├── approved break classifications
├── adjustment chain
├── laborPolicyVersion
├── holiday/calendar context
└── timezone IANA

PayrollProjectionResult
├── regular / break / overtime / night minutes
├── blocked / not-configured dimensions
├── rule trace + rounding trace
├── inputHash + calculationVersion
└── provenance / export linkage
```
