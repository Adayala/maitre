# Especificación — SPEC-228

## Definición formal

```json
{
  "code": "SEATS",
  "name": "Plazas",
  "billingType": "SERVICE | QUANTITY",
  "billingScope": "TENANT | BRAND | FISCAL_ENTITY | BRANCH | POS | CONNECTOR",
  "unitPrice": 500,
  "currency": "ARS",
  "period": "MONTHLY",
  "dependsOn": ["FLOOR"],
  "isActive": true,
  "version": 1
}
```

`code` es la clave primaria estable. `unitPrice` es fijo por servicio o por unidad según
`billingType`. `dependsOn` contiene códigos del mismo catálogo.

## Persistencia

La tabla canónica es `subscription_catalog_items`. El catálogo es una referencia compartida,
legible por sesiones autenticadas y modificable sólo por procesos internos.
