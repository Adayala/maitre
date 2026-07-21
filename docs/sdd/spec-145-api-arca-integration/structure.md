# STRUCTURE — SPEC-145

## Componentes propuestos

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

## Entidades mínimas

### FiscalCredential

- `tenantId`, `fiscalEntityId`, `environment`
- referencia al certificado y clave en un secret manager
- CUIT representada, servicios asociados, vigencia y estado
- nunca devuelve material criptográfico mediante APIs de aplicación

### FiscalAuthorization

- comprobante interno, CUIT, punto de venta, tipo y número
- CAE/CAEA y vencimiento
- request/response normalizados, resultado, observaciones y errores
- idempotency key y timestamps

### VatBookExport

- tenant, entidad fiscal, período y versión del diseño ARCA
- hashes de archivos, totales de control y estado de validación
- estado: `DRAFT`, `VALIDATED`, `EXPORTED`, `PRESENTATION_CONFIRMED`
- evidencia opcional de presentación cargada por el usuario

## Restricción de dependencia

El dominio de Maitre consume una interfaz fiscal interna. SOAP, CMS, certificados y códigos específicos de ARCA quedan encapsulados en el adaptador.
