# Estructura — SPEC-145

```text
Billing / Cash
    |
    v
Fiscal Orchestrator
    |-- Credential Vault (certificado y clave por CUIT/ambiente)
    |-- WSAA Token Manager (cache y renovación de TA)
    |-- WSFEv1 Adapter (SOAP)
    |-- Receipt Reconciliation
    |-- ARCA Parameter Sync
    `-- VAT Book Exporter (TXT/ZIP + reporte de control)
```
