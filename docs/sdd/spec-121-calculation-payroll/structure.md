# Estructura — SPEC-121

```text
PayrollProjectionInput
├── approved time intervals
├── approved break classifications
├── adjustment chain
├── laborPolicyVersion
└── timezone IANA

PayrollProjectionResult
├── regular / break / overtime / night minutes
├── rule trace + rounding trace
├── inputHash + calculationVersion
└── provenance / export linkage
```
