# Estructura — SPEC-140

```text
FiscalCertificate
├── scope: fiscalEntity/CUIT, service, environment
├── metadata: fingerprint, issuer
├── validity: notBefore, notAfter
├── secret reference
├── status + rotation timestamps
└── audit metadata
```
